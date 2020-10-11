const { toHostList, registerDomains } = require('../scripts/register-domains');
const { TTL } = require('../utils/constants');

describe('toHostList', () => {
  it('should flatten domain data to list of hosts (without https)', () => {
    const res = toHostList([
      { name: 'akshay', record: { CNAME: 'phenax.github.io' } },
      { name: 'foobar', record: { CNAME: 'v.io' } },
      { name: 'xx', record: { A: ['1.2.3.4', '5.6.3.2', '1.2.31.1'] } },
    ]);

    expect(res).toEqual([
      { name: 'akshay', type: 'CNAME', address: 'phenax.github.io', ttl: TTL },
      { name: 'foobar', type: 'CNAME', address: 'v.io', ttl: TTL },
      { name: 'xx', type: 'A', address: '1.2.3.4', ttl: TTL },
      { name: 'xx', type: 'A', address: '5.6.3.2', ttl: TTL },
      { name: 'xx', type: 'A', address: '1.2.31.1', ttl: TTL },
    ]);
  });
});

