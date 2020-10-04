const R = require('ramda');
const Namecheap = require('@rqt/namecheap');

const path = require('path');
require('dotenv').config({ path: path.resolve('.env.sandbox') });

const IS_SANDBOX = true;
const { NC_USER, NC_API_KEY, NC_DOMAIN } = process.env;
const TTL = 5*60;

const getDomainService = ({ Namecheap }) => {
  const nc = new Namecheap({
    user: NC_USER,
    key: NC_API_KEY,
    ip: '103.226.85.9',
    sandbox: IS_SANDBOX,
  });

  let hostList = [];

  console.log(NC_USER, NC_DOMAIN, NC_API_KEY);

  const getHosts = async () => {
    if (hostList.length) return hostList;

    const list = await nc.dns.getHosts(NC_DOMAIN)
      .then(R.propOr([], 'hosts'))
      .then(R.map(host => ({
        ...host,
        HostName: host.Name,
        RecordType: host.Type,
        Address: `${host.Address}`.replace(/\.$/g, ''),
        Name: undefined,
        Type: undefined,
      })));

    //console.log(list);
    hostList = list;
    return list;
  };

  const setHosts = hosts => nc.dns.setHosts(NC_DOMAIN, hosts);

  const findHost = async host => {
    const list = await getHosts();
    const matchIndex = list.findIndex(R.whereEq({
      RecordType: host.RecordType,
      HostName: host.HostName,
      Address: host.Address,
      // MXPref: host.MXPref,
      TTL: host.TTL || TTL,
    }));

    return matchIndex;
  };

  const mergeHosts = async hosts => {
    return hosts;
    //const hostList = await getHosts();
    //hosts.map()
    // If source is bigger, merge all matching items and add new ones
    // If dest is bigger, merge all matching items and add missing ones
  };

  return { getHosts, setHosts, findHost };
}

module.exports = {
  getDomainService,
  domainService: getDomainService({ Namecheap }),
};

//getDomainService({ Namecheap }).setHosts([
  //{ HostName: 'fuck', RecordType: 'CNAME', Address: 'google.com', TTL },
  //{ HostName: 'fuck.booboo.xyz', RecordType: 'URL', Address: 'https://fuck.booboo.xyz' },
  //{ HostName: 'foobar', RecordType: 'CNAME', Address: 'duckduckgo.com', TTL },
  //{ HostName: 'hello', RecordType: 'A', Address: '103.130.211.123', TTL },
//]).then(console.log).catch(console.error);

//getDomainService({ Namecheap }).getHosts()
  //.then(console.log)
  //.catch(console.error);

//getDomainService({ Namecheap }).hasHost({ HostName: 'fuck', RecordType: 'CNAME', Address: 'duckduckgo.com' });

