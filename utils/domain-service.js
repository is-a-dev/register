const R = require('ramda');
const { cpanel } = require('./lib/cpanel');

const flattenPromise = xs => Promise.all(xs);

const getDomainService = ({ cpanel }) => {
  let hostList = [];

  const getHosts = async () => {
    if (hostList.length) return hostList;

    const list = await cpanel.fetchZoneRecords()
      .then(R.map(host => R.omit(['Name', 'Type'], {
        ...host,
        address: `${host.cname || host.address}`.replace(/\.$/g, ''),
      })));

    hostList = list;
    return list;
  };

  const setHosts = R.compose(flattenPromise, R.map(cpanel.addZoneRecord));

  const getHostKey = host => `${host.HostName}--${host.RecordType}`;
  const toHostMap = hosts => hosts.reduce((acc, host) => {
    const key = getHostKey(host);
    return { ...acc, [key]: [ ...(acc[key] || []), host ] };
  }, {});

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

const domainService = getDomainService({ cpanel });

module.exports = {
  getDomainService,
  domainService,
};
