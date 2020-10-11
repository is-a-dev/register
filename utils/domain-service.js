const R = require('ramda');
const { cpanel } = require('./lib/cpanel');
const {DOMAIN_DOMAIN} = require('./constants');

const flattenPromise = xs => Promise.all(xs);

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

const getDomainService = ({ cpanel }) => {
  let hostList = [];

  const fetchZoneRecords = () => cpanel.fetchZoneRecords().then(R.map(zoneToRecord));
  const fetchRedirections = () => cpanel.fetchRedirections().then(R.map(redirectionToRecord));

  const addZoneRecord = R.compose(cpanel.addZoneRecord, recordToZone);
  const addRedirection = R.compose(cpanel.addRedirection, recordToRedirection);

  const getHosts = async () => {
    if (hostList.length) return hostList;

    const list = await Promise.all([fetchZoneRecords(), fetchRedirections()]).then(R.flatten);

    hostList = list;
    return list;
  };

  const setHosts = R.compose(flattenPromise, R.map(R.cond([
    [ R.propEq('type', 'URL'),  addRedirection ],
    [ R.T,                      addZoneRecord ],
  ])));

  const updateHosts = async hosts => {
    const hostList = await getHosts();
    const remoteHostMap = toHostMap(hostList);
    const localHostMap = toHostMap(hosts);

    const newHostList = R.toPairs(localHostMap).reduce((acc, [key, local]) => {
      const remote = remoteHostMap[key];

      if (remote) {
        return acc.concat(local.map((localItem, index) => R.merge(remote[index], localItem)));
      }

      return [...acc, ...local];
    }, []);

    return setHosts(newHostList);
  };

  return { getHosts, setHosts, updateHosts };
};

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

const domainService = getDomainService({ cpanel });

module.exports = {
  getDomainService,
  domainService,
  diffRecords,
};
