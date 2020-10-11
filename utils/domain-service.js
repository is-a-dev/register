const R = require('ramda');
const { cpanel } = require('./lib/cpanel');
const {DOMAIN_DOMAIN} = require('./constants');

const flattenPromise = xs => Promise.all(xs);

const getDomainService = ({ cpanel }) => {
  let hostList = [];

  const fetchZoneRecords = () => cpanel.fetchZoneRecords().then(R.map(host => ({
    ...host,
    name: `${host.name}`,
    type: `${host.type}`,
    address: `${host.cname || host.address}`.replace(/\.$/g, ''),
  })));

  const fetchRedirections = () => cpanel.fetchRedirections().then(R.map(host => ({
    name: `${host.domain}`.replace('.' + DOMAIN_DOMAIN, ''),
    type: 'URL',
    address: `${host.destination}`,
  })));

  const getHosts = async () => {
    if (hostList.length) return hostList;

    const list = await Promise.all([fetchZoneRecords(), fetchRedirections()]).then(R.flatten);

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
