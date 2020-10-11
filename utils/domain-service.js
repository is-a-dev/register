const R = require('ramda');
const { cpanel } = require('./lib/cpanel');
const { DOMAIN_DOMAIN } = require('./constants');

const promiseAll = xs => Promise.all(xs);

const recordToRedirection = ({ name, address }) => ({
  domain: `${name}.${DOMAIN_DOMAIN}`,
  redirect: address,
  type: 'permanent',
  redirect_wildcard: 1,
  redirect_www: 0,
});
const recordToZone = R.identity;

const zoneToRecord = ({ name, type, cname, address, ...host }) => ({
  ...host,
  name: `${name}`,
  type: `${type}`,
  address: `${cname || address}`.replace(/\.$/g, ''),
});
const redirectionToRecord = ({ domain, destination }) => ({
  name: `${domain}`.replace('.' + DOMAIN_DOMAIN, ''),
  type: 'URL',
  address: `${destination}`,
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
  return promise.then(() => Promise.all(batch.map(fn => fn())));
}, Promise.resolve());

const getDomainService = ({ cpanel }) => {
  let hostList = [];

  const fetchZoneRecords = () => cpanel.zone.fetch().then(R.map(zoneToRecord));
  const fetchRedirections = () => cpanel.redirection.fetch().then(R.map(redirectionToRecord));

  const addZoneRecord = lazyTask(R.compose(cpanel.zone.add, recordToZone));
  const addRedirection = lazyTask(R.compose(cpanel.redirection.add, recordToRedirection));

  const editZoneRecord = lazyTask(R.compose(cpanel.zone.edit, recordToZone));
  const editRedirection = lazyTask(R.compose(cpanel.redirection.edit, recordToRedirection));

  const getHosts = async () => {
    if (hostList.length) return hostList;

    const list = await Promise.all([fetchZoneRecords(), fetchRedirections()]).then(R.flatten);

    hostList = list;
    return list;
  };

  const addRecords = R.compose(batchLazyTasks(10), R.map(R.cond([
    [ R.propEq('type', 'URL'),  addRedirection ],
    [ R.T,                      addZoneRecord ],
  ])));
  const editRecords = R.compose(batchLazyTasks(10), R.map(R.cond([
    [ R.propEq('type', 'URL'),  editRedirection ],
    [ R.T,                      editZoneRecord ],
  ])));

  const updateHosts = async hosts => {
    const remoteHostList = await getHosts();
    const { add, edit } = diffRecords(remoteHostList, hosts);

    return executeBatch(addRecords(add).concat(editRecords(edit)));
  };

  return { getHosts, updateHosts };
};

const domainService = getDomainService({ cpanel });

module.exports = {
  getDomainService,
  domainService,
  diffRecords,
};
