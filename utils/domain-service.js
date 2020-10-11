const R = require('ramda');
const { cpanel } = require('./lib/cpanel');
const { DOMAIN_DOMAIN } = require('./constants');

const recordToRedirection = ({ name, address }) => ({
  domain: `${name}.${DOMAIN_DOMAIN}`,
  redirect: address,
  type: 'permanent',
  redirect_wildcard: 1,
  redirect_www: 0,
});
const recordToZone = ({ name, type, address, ...rec }) => ({
  ...rec, //line
  name,
  type,
  ...(type === 'CNAME' ? { cname: address } : { address }),
});

const cleanName = name => `${name}`.replace(new RegExp(`\.${DOMAIN_DOMAIN}\.?$`), '').toLowerCase();

const zoneToRecord = ({ name, type, cname, address, record, ...host }) => ({
  ...host,
  name: cleanName(name),
  type: `${type}`,
  address: `${cname || address || record}`.replace(/\.$/g, '').toLowerCase(),
});
const redirectionToRecord = ({ domain, destination }) => ({
  name: cleanName(domain),
  type: 'URL',
  address: `${destination}`.replace(/\/$/g, ''),
});

const getHostKey = host => `${host.name}##${host.type}`;

const toHostMap = hosts => hosts.reduce((acc, host) => {
  const key = getHostKey(host);
  return { ...acc, [key]: [ ...(acc[key] || []), host ] };
}, {});

const diffRecords = (oldRecords, newRecords) => {
  const remoteHostMap = toHostMap(oldRecords);
  const localHostMap = toHostMap(newRecords);

  return R.toPairs(localHostMap).reduce((acc, [key, local]) => {
    const remote = remoteHostMap[key];

    if (remote) {
      let adds = [];
      let edits = [];

      const diff = R.differenceWith((a, b) => a.address === b.address, local, remote);

      if (diff.length === local.length - remote.length) {
        adds = diff;
      } else {
        edits = diff;
      }

      return { ...acc, add: acc.add.concat(adds), edit: acc.edit.concat(edits) };
    }

    return { ...acc, add: acc.add.concat(local) };
  }, { add: [], edit: [] });
};

const lazyTask = fn => data => () => fn(data);

const batchLazyTasks = count => tasks => tasks.reduce((batches, task) => {
  if (batches.length === 0) return [[task]];

  const full = R.init(batches);
  const last = R.last(batches);

  if (last.length >= count) return [...batches, [task]];
  return [...full, [...last, task]];
}, []);

const executeBatch = (batches) => batches.reduce((promise, batch) => {
  return promise.then(() => {
    console.log('>>> Running batch', batch.length);
    return Promise.all(batch.map(fn => fn().catch(e => {
      console.error(e);
    }))).then(values => {
      const results = values.map(R.pathOr([], ['cpanelresult', 'data', 0]));
      const failed = results.filter(x => (x.result || {}).status != 1);
      console.log(`${values.length - failed.length}/${values.length}`);
      failed.length && console.log(failed);
    });
  });
}, Promise.resolve());

const getDomainService = ({ cpanel }) => {
  let hostList = [];

  const fetchZoneRecords = () => cpanel.zone.fetch().then(R.map(zoneToRecord));
  const fetchRedirections = () => cpanel.redirection.fetch().then(R.map(redirectionToRecord));

  const addZoneRecord = lazyTask(R.compose(cpanel.zone.add, recordToZone));
  const editZoneRecord = lazyTask(R.compose(cpanel.zone.edit, recordToZone));
  const addRedirection = lazyTask(R.compose(cpanel.redirection.add, recordToRedirection));
  const editRedirection = lazyTask(R.compose(cpanel.redirection.edit, recordToRedirection));

  const getHosts = async () => {
    if (hostList.length) return hostList;

    const list = await Promise.all([fetchZoneRecords(), fetchRedirections()]).then(R.flatten);

    hostList = list;
    return list;
  };

  const BATCH_SIZE = 10;

  const addRecords = R.compose(batchLazyTasks(BATCH_SIZE), R.map(R.cond([
    [ R.propEq('type', 'URL'),  addRedirection ],
    [ R.T,                      addZoneRecord ],
  ])));
  const editRecords = R.compose(batchLazyTasks(BATCH_SIZE), R.map(R.cond([
    [ R.propEq('type', 'URL'),  editRedirection ],
    [ R.T,                      editZoneRecord ],
  ])));

  const updateHosts = async hosts => {
    const remoteHostList = await getHosts();
    const { add, edit } = diffRecords(remoteHostList, hosts);

    await executeBatch(addRecords(add).concat(editRecords(edit)));
    return { additions: add.length, edits: edit.length };
  };

  return { getHosts, updateHosts };
};

const domainService = getDomainService({ cpanel });

module.exports = {
  getDomainService,
  domainService,
  diffRecords,
};
