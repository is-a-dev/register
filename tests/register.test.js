const { toHostList } = require('../scripts/register-domains');
const { NC_DOMAIN, TTL } = require('../utils/constants');

describe('toHostList', () => {
  it('should flatten domain data to list of hosts (without https)', () => {
    const res = toHostList([
      { name: 'akshay', forceHttps: false, record: { CNAME: ['phenax.github.io'] } },
      { name: 'foobar', forceHttps: false, record: { CNAME: ['v.io'] } },
      { name: 'xx', forceHttps: false, record: { A: ['1.2.3.4', '5.6.3.2', '1.2.31.1'] } },
    ]);

    expect(res).toEqual([
      { HostName: 'akshay', RecordType: 'CNAME', Address: 'phenax.github.io', TTL },
      { HostName: 'foobar', RecordType: 'CNAME', Address: 'v.io', TTL },
      { HostName: 'xx', RecordType: 'A', Address: '1.2.3.4', TTL },
      { HostName: 'xx', RecordType: 'A', Address: '5.6.3.2', TTL },
      { HostName: 'xx', RecordType: 'A', Address: '1.2.31.1', TTL },
    ]);
  });

  it('should flatten domain data to list of hosts (with https)', () => {
    const res = toHostList([
      { name: 'akshay', forceHttps: true, record: { CNAME: ['phenax.github.io'] } },
      { name: 'foobar', forceHttps: false, record: { CNAME: ['v.io'] } },
      { name: 'xx', forceHttps: true, record: { A: ['1.2.3.4', '5.6.3.2', '1.2.31.1'] } },
    ]);

    expect(res).toEqual([
      { HostName: 'akshay', RecordType: 'CNAME', Address: 'phenax.github.io', TTL },
      { HostName: 'akshay', RecordType: 'URL', Address: `https://akshay.${NC_DOMAIN}` },
      { HostName: 'foobar', RecordType: 'CNAME', Address: 'v.io', TTL },
      { HostName: 'xx', RecordType: 'A', Address: '1.2.3.4', TTL },
      { HostName: 'xx', RecordType: 'A', Address: '5.6.3.2', TTL },
      { HostName: 'xx', RecordType: 'A', Address: '1.2.31.1', TTL },
      { HostName: 'xx', RecordType: 'URL', Address: `https://xx.${NC_DOMAIN}` },
    ]);
  });
});
