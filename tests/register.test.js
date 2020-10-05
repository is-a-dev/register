const { toHostList, registerDomains } = require('../scripts/register-domains');
const { TTL } = require('../utils/constants');
const { getDomainService } = require('../utils/domain-service');

describe('toHostList', () => {
  it('should flatten domain data to list of hosts (without https)', () => {
    const res = toHostList([
      { name: 'akshay', record: { CNAME: 'phenax.github.io' } },
      { name: 'foobar', record: { CNAME: 'v.io' } },
      { name: 'xx', record: { A: ['1.2.3.4', '5.6.3.2', '1.2.31.1'] } },
    ]);

    expect(res).toEqual([
      { HostName: 'akshay', RecordType: 'CNAME', Address: 'phenax.github.io', TTL },
      { HostName: 'foobar', RecordType: 'CNAME', Address: 'v.io', TTL },
      { HostName: 'xx', RecordType: 'A', Address: '1.2.3.4', TTL },
      { HostName: 'xx', RecordType: 'A', Address: '5.6.3.2', TTL },
      { HostName: 'xx', RecordType: 'A', Address: '1.2.31.1', TTL },
    ]);
  });
});

describe('registerDomains', () => {
  it('should register the new set of hosts generated from domains list', () => {
    const localHosts = [];
    const remoteHosts = [];

    //const domainService = getDomainService({ Namecheap:  });
    //registerDomains({ getDomains: async () => localHosts, domainService });
  });
});

