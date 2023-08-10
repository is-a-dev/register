const R = require('ramda');
const { cpanel } = require('./lib/cpanel');
const { DOMAIN_DOMAIN } = require('./constants');
const { then, log, print, lazyTask, batchLazyTasks } = require('./helpers');

const BATCH_SIZE = 1;

const recordToRedirection = ({ name, address }) => ({
  domain: name === '@' ? DOMAIN_DOMAIN : `${name}.${DOMAIN_DOMAIN}`,
  redirect: address,
  type: 'permanent',
  redirect_wildcard: 1,
  redirect_www: 1,
});
const recordToZone = ({ name, type, address, id, priority }) => ({
  line: id,
  name: name === '@' ? `${DOMAIN_DOMAIN}.` : name,
  type,
  address,
  ...(type === 'MX' ? { priority } : {}),
  ...(type === 'CNAME' ? { cname: address } : {}),
  ...(type === 'TXT' ? { txtdata: address } : {}),
});

const cleanName = name =>
  name === DOMAIN_DOMAIN ? '@' : `${name}`.replace(new RegExp(`\\.${DOMAIN_DOMAIN}\\.?$`), '').toLowerCase();

const zoneToRecord = ({
  name,
  type,
  cname,
  address,
  priority,
  preference,
  exchange,
  record,
  line: id
}) =>
  ({
    id,
    name: cleanName(name),
    type: `${type}`,
    address: `${exchange || cname || address || record}`.replace(/\.$/g, '').toLowerCase(),
    priority: priority || preference,
  });
const redirectionToRecord = ({ domain, destination }) => ({
  id: domain,
  name: cleanName(domain),
  type: 'URL',
  address: `${destination}`.replace(/\/$/g, ''),
});

const recordToEmailMx = ({ name, address, priority }) => ({
  domain: `${name}.is-a.dev`,
  exchanger: address,
  priority,
})

const getHostKey = host =>
  `${host.name.toLowerCase()}##${host.type.toLowerCase()}##${host.address.toLowerCase()}`;

const diffRecords = (oldRecords, newRecords) => {
  const isMatchingRecord = (a, b) => getHostKey(a) === getHostKey(b);

  const remove = R.differenceWith(isMatchingRecord, oldRecords, newRecords);
  const add = R.differenceWith(isMatchingRecord, newRecords, oldRecords)
    .filter(r => !['www'].includes(r.name));

  return { add, remove };
};

const executeBatch = (batches) => batches.reduce((promise, batch, index) => {
  return promise.then(async () => {
    log('>>> Running batch number:', index + 1, `(size: ${batch.length})`);

    const values = await Promise.all(batch.map(fn => fn().catch(e => console.error(e))));

    const results = values.map(data => R.pathOr({ result: data }, ['cpanelresult', 'data', 0], data));
    const failed = results.filter(x => (x.result || {}).status != 1);

    log(`${values.length - failed.length}/${values.length}`);
    failed.length && log(JSON.stringify(failed, null, 2));

    return null;
  });
}, Promise.resolve());

const getDomainService = ({ cpanel }) => {
  const fetchZoneRecords = R.compose(then(R.map(zoneToRecord)), cpanel.zone.fetch);
  const fetchRedirections = R.compose(then(R.map(redirectionToRecord)), cpanel.redirection.fetch);

  const addZoneRecord = lazyTask(R.compose(
    R.ifElse(R.propEq('type', 'MX'),
      R.compose(cpanel.email.add, recordToEmailMx),
      cpanel.zone.add
    ),
    recordToZone,
    print(r => `Adding zone for ${r.name}: (${r.type} ${r.address})...`),
  ));
  const removeZoneRecord = lazyTask(R.compose(
    R.ifElse(R.propEq('type', 'MX'),
      R.compose(cpanel.email.remove, recordToEmailMx),
      R.compose(cpanel.zone.remove, R.pick(['line']))
    ),
    recordToZone,
    print(r => `Deleting zone for ${r.name}: (${r.type} ${r.address})...`),
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
    print(({ name }) => `Deleting redirection for ${name}`),
  ));

  const getHosts = () =>
    Promise.all([fetchZoneRecords(), fetchRedirections()]).then(R.flatten);

  const addRecords = R.compose(batchLazyTasks(BATCH_SIZE), R.filter(Boolean), R.map(R.cond([
    [R.propEq('name', 'www'), R.always(null)], // Ignore www
    [R.propEq('type', 'URL'), addRedirection],
    [R.T, addZoneRecord],
  ])));
  const removeRecords = R.compose(batchLazyTasks(BATCH_SIZE), R.map(R.cond([
    [R.propEq('type', 'URL'), removeRedirection],
    [R.T, removeZoneRecord],
  ])));

  const updateHosts = async hosts => {
    const remoteHostList = await getHosts();
    const { add, remove } = diffRecords(remoteHostList, hosts);
    console.log(`Adding ${add.length}; Removing ${remove.length}`)

    await executeBatch([
      ...removeRecords(remove),
      ...addRecords(add),
    ]);
    return { added: add.length, removed: remove.length };
  };

  return { getHosts, get: cpanel.zone.fetch, addZoneRecord, removeZoneRecord, updateHosts };
};

const domainService = getDomainService({ cpanel });

module.exports = {
  getDomainService,
  domainService,
  diffRecords,
};
