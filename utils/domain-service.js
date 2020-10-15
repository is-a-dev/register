const R = require('ramda');
const { cpanel } = require('./lib/cpanel');
const { DOMAIN_DOMAIN, IS_TEST } = require('./constants');

const log = IS_TEST ? () => {} : console.log;

const recordToRedirection = ({ name, address }) => ({
  domain: `${name}.${DOMAIN_DOMAIN}`,
  redirect: address,
  type: 'permanent',
  redirect_wildcard: 1,
  redirect_www: 1,
});
const recordToZone = ({ name, type, address, id }) => ({
  line: id,
  name,
  type,
  address,
  ...(type === 'CNAME' ? { cname: address } : {}),
});

const cleanName = name => `${name}`.replace(new RegExp(`\.${DOMAIN_DOMAIN}\.?$`), '').toLowerCase();

const zoneToRecord = ({ name, type, cname, address, record, line: id }) => ({
  id,
  name: cleanName(name),
  type: `${type}`,
  address: `${cname || address || record}`.replace(/\.$/g, '').toLowerCase(),
});
const redirectionToRecord = ({ domain, destination }) => ({
  id: domain,
  name: cleanName(domain),
  type: 'URL',
  address: `${destination}`.replace(/\/$/g, ''),
});

const getHostKey = host => `${host.name}##${host.type}##${host.address}`;

const diffRecords = (oldRecords, newRecords) => {
  const isMatchingRecord = (a, b) => getHostKey(a) === getHostKey(b);

  const remove = R.differenceWith(isMatchingRecord, oldRecords, newRecords);
  const add = R.differenceWith(isMatchingRecord, newRecords, oldRecords)
    .filter(r => !['www', '@'].includes(r.name));

  return { add, remove };
};

const print = fn => x => log(fn(x)) || x;

const lazyTask = fn => data => () => fn(data);

const batchLazyTasks = count => tasks => tasks.reduce((batches, task) => {
  if (batches.length === 0) return [[task]];

  const full = R.init(batches);
  const last = R.last(batches);

  if (last.length >= count) return [...batches, [task]];
  return [...full, [...last, task]];
}, []);

const executeBatch = (batches) => batches.reduce((promise, batch, index) => {
  return promise.then(async () => {
    log('>>> Running batch number:', index + 1, `(size: ${batch.length})`);

    const values = await Promise.all(batch.map(fn => fn().catch(e => console.error(e))));

    const results = values.map(R.pathOr({}, ['cpanelresult', 'data', 0]));
    const failed = results.filter(x => (x.result || {}).status != 1);

    log(`${values.length - failed.length}/${values.length}`);
    failed.length && log(failed);

    return null;
  });
}, Promise.resolve());

const getDomainService = ({ cpanel }) => {
  let hostList = [];

  const fetchZoneRecords = () => cpanel.zone.fetch().then(R.map(zoneToRecord));
  const fetchRedirections = () => cpanel.redirection.fetch().then(R.map(redirectionToRecord));

  const addZoneRecord = lazyTask(R.compose(
    cpanel.zone.add,
    recordToZone,
    print(({ name }) => `Adding zone for ${name}...`),
  ));
  const removeZoneRecord = lazyTask(R.compose(
    cpanel.zone.remove,
    R.pick(['line']),
    recordToZone,
    print(({ name }) => `Editing zone for ${name}...`),
  ));
  const addRedirection = lazyTask(R.compose(
    cpanel.redirection.add,
    recordToRedirection,
    print(({ name }) => `Adding redirection for ${name}`),
  ));
  const removeRedirection = lazyTask(R.compose(
    cpanel.redirection.remove,
    R.pick(['domain']),
    recordToRedirection,
    print(({ name }) => `Editing redirection for ${name}`),
  ));

  const getHosts = async () => {
    if (hostList.length) return hostList;

    const list = await Promise.all([fetchZoneRecords(), fetchRedirections()]).then(R.flatten);

    hostList = list;
    return list;
  };

  const BATCH_SIZE = 1;

  const addRecords = R.compose(batchLazyTasks(BATCH_SIZE), R.filter(Boolean), R.map(R.cond([
    [ R.propEq('name', 'www'),  R.always(null) ],
    [ R.propEq('type', 'URL'),  addRedirection ],
    [ R.T,                      addZoneRecord ],
  ])));
  const removeRecords = R.compose(batchLazyTasks(BATCH_SIZE), R.map(R.cond([
    [ R.propEq('type', 'URL'),  removeRedirection ],
    [ R.T,                      removeZoneRecord ],
  ])));

  const updateHosts = async hosts => {
    const remoteHostList = await getHosts();
    const { add, remove } = diffRecords(remoteHostList, hosts);

    await executeBatch([
      ...removeRecords(remove),
      ...addRecords(add),
    ]);
    return { added: add.length, removed: remove.length };
  };

  return { getHosts, updateHosts };
};

const domainService = getDomainService({ cpanel });

module.exports = {
  getDomainService,
  domainService,
  diffRecords,
};
