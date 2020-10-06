const R = require('ramda');
const Namecheap = require('@rqt/namecheap');
const { NC_DOMAIN, NC_USER, NC_API_KEY, ENV, IP_ADDRESS } = require('../utils/constants');

const IS_SANDBOX = ENV === 'sandbox';

const getDomainService = ({ nc }) => {
  let hostList = [];

  const getHosts = async () => {
    if (hostList.length) return hostList;

    const list = await nc.dns.getHosts(NC_DOMAIN)
      .then(R.propOr([], 'hosts'))
      .then(R.map(host => R.omit(['Name', 'Type'], {
        ...host,
        HostName: host.Name,
        RecordType: host.Type,
        Address: `${host.Address}`.replace(/\.$/g, ''),
      })));

    hostList = list;
    return list;
  };

  const setHosts = hosts => nc.dns.setHosts(NC_DOMAIN, hosts);

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

if (!NC_API_KEY) {
  console.error('NC_API_KEY cannot be empty');
  process.exit(1);
}

const nc = new Namecheap({
  user: NC_USER,
  key: NC_API_KEY,
  ip: IP_ADDRESS,
  sandbox: IS_SANDBOX,
});

const domainService = getDomainService({ nc });

module.exports = {
  getDomainService,
  domainService,
};
