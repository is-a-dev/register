const R = require('ramda');
const { toHostList, registerDomains } = require('../scripts/register-domains');
const { TTL, DOMAIN_DOMAIN } = require('../utils/constants');
const { getDomainService } = require('../utils/domain-service');

const getCpanel = ({ zone, addZone, editZone, redir, addRedir, editRedir } = {}) => ({
  zone: {
    fetch: (_) => zone(),
    add: (rec) => addZone(rec),
    edit: (rec) => editZone(rec),
  },
  redirection: {
    fetch: (_) => redir(),
    add: (rec) => addRedir(rec),
    edit: (rec) => editRedir(rec),
  },
});

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

describe('registerDomains', () => {
  const addZone = jest.fn(async () => ({}));
  const editZone = jest.fn(async () => ({}));
  const addRedir = jest.fn(async () => ({}));
  const editRedir = jest.fn(async () => ({}));

  const mockDS = ({ zones, redirections }) => getDomainService({ cpanel: getCpanel({
    zone: async () => zones,
    redir: async () => redirections,
    addZone,
    addRedir,
    editZone,
    editRedir,
  }) });

  const getRecordCalls = recfn => recfn.mock.calls.map(R.head).map(R.pick(['name', 'type', 'address', 'redirect', 'domain']));

  beforeEach(() => {
    addZone.mockClear();
    editZone.mockClear();
    addRedir.mockClear();
    editRedir.mockClear();
  });

  it('should register the new set of hosts generated from domains list', async () => {
    const localHosts = [
      { name: 'a', record: { CNAME: 'hello' } },
      { name: 'b', record: { CNAME: 'xaa' } },
    ];
    const remoteHosts = [
      { someididk: 1, name: 'a', type: 'CNAME', address: 'hello' },
      { someididk: 2, name: 'b', type: 'CNAME', address: 'goo' },
      { someididk: 2, name: 'b', type: 'CNAME', address: 'xaa' },
    ];
    const remoteRedirections = [];

    const domainService = mockDS({ zones: remoteHosts, redirections: remoteRedirections });
    await registerDomains({ getDomains: async () => localHosts, domainService });

    expect(addZone).toBeCalledTimes(0);
    expect(editZone).toBeCalledTimes(0);
    expect(addRedir).toBeCalledTimes(0);
    expect(editRedir).toBeCalledTimes(0);
  });

  it('should add the new set hosts', async () => {
    const localHosts = [
      { name: 'a', record: { CNAME: 'boo', URL: 'z' } },
      { name: 'b', record: { CNAME: 'xaa', URL: 'x' } },
      { name: 'c', record: { CNAME: 'yello', URL: 'https://google.com' } },
    ];
    const remoteHosts = [
      { someididk: 1, name: 'a', type: 'CNAME', address: 'boo' },
      { someididk: 2, name: 'b', type: 'CNAME', address: 'xaa' },
    ];
    const remoteRedirections = [
      { domain: `b.${DOMAIN_DOMAIN}`, destination: 'x' },
      { domain: `a.${DOMAIN_DOMAIN}`, destination: 'y' },
    ];

    const domainService = mockDS({ zones: remoteHosts, redirections: remoteRedirections });
    await registerDomains({ getDomains: async () => localHosts, domainService });

    expect(addZone).toBeCalledTimes(1);
    expect(editZone).toBeCalledTimes(0);
    expect(addRedir).toBeCalledTimes(1);
    expect(editRedir).toBeCalledTimes(1);
  });
});

