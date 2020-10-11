const R = require('ramda');
const { getDomainService, diffRecords } = require('../utils/domain-service');

const getCpanel = ({ zone, redir, setZone, setRedir } = {}) => ({
  addZoneRecord: (rec) => setZone(rec),
  addRedirection: (rec) => setRedir(rec),
  fetchZoneRecords: (_) => zone(),
  fetchRedirections: (_) => redir(),
});

describe('diffRecords', () => {
  it('should show added record', () => {
    const oldRecords = [
      { name: 'xx', type: 'CNAME', address: 'fck.com.' },
      { name: 'xa', type: 'A', address: '111.1.1212.1' },
    ];
    const newRecords = [
      { name: 'xx', type: 'CNAME', address: 'fck.com.' },
      { name: 'xa', type: 'A', address: '111.1.1212.1' },
      { name: 'boo', type: 'CNAME', address: 'x.com' },
    ];

    const result = diffRecords(oldRecords, newRecords);
    expect(result).toEqual({
      edit: [],
      add: [
        { name: 'boo', type: 'CNAME', address: 'x.com' },
      ],
    });
  });

  it('should show edited records', () => {
    const oldRecords = [
      { name: 'xx', type: 'CNAME', address: 'fck.com.' },
      { name: 'xa', type: 'A', address: '111.1.1212.1' },
    ];
    const newRecords = [
      { name: 'xx', type: 'CNAME', address: 'fck.com.' },
      { name: 'xa', type: 'A', address: '69.69.69.69' },
    ];

    const result = diffRecords(oldRecords, newRecords);
    expect(result).toEqual({
      edit: [
        { name: 'xa', type: 'A', address: '69.69.69.69' },
      ],
      add: [],
    });
  });

  it('should show added records with the same name and record type', () => {
    const oldRecords = [
      { name: 'xx', type: 'CNAME', address: 'fck.com.' },
      { name: 'xa', type: 'A', address: '69.69.69.69' },
    ];
    const newRecords = [
      { name: 'xx', type: 'CNAME', address: 'fck.com.' },
      { name: 'xa', type: 'A', address: '69.69.69.69' },
      { name: 'xa', type: 'A', address: '69.69.4.20' },
    ];

    const result = diffRecords(oldRecords, newRecords);
    expect(result).toEqual({
      edit: [],
      add: [
        { name: 'xa', type: 'A', address: '69.69.4.20' },
      ],
    });
  });
});

describe('Domain service', () => {
  const setZone = jest.fn(async () => ({}));
  const setRedir = jest.fn(async () => ({}));

  const mockDS = ({ zones, redirections }) => getDomainService({ cpanel: getCpanel({
    zone: async () => ({ hosts: zones }),
    redir: async () => ({ hosts: redirections }),
    setZone,
    setRedir,
  }) });

  const getZoneCalls = () => setZone.mock.calls.map(R.head).map(R.pick(['name', 'type', 'address']));

  beforeEach(() => {
    setZone.mockClear();
    setRedir.mockClear();
  });

  describe('getHosts', () => {
    it('should resolve with a list of hosts', async () => {
      const zones = [
        { name: 'xx', type: 'CNAME', address: 'fck.com.' },
        { name: 'xx', type: 'A', address: '111.1.1212.1' },
      ];
      const redirections = [];
      const zone = async () => zones;
      const redir = async () => redirections;
      const mockDomainService = getDomainService({ cpanel: getCpanel({ zone, redir }) });
      const list = await mockDomainService.getHosts();

      expect(list).toEqual([
        { name: 'xx', type: 'CNAME', address: 'fck.com' },
        { name: 'xx', type: 'A', address: '111.1.1212.1' },
      ]);
    });

    it('should resolve with a redirections', async () => {
      const zones = [
        { name: 'xx', type: 'CNAME', address: 'fck.com.' },
        { name: 'xx', type: 'A', address: '111.1.1212.1' },
      ];
      const redirections = [
        { domain: 'foo.booboo.xyz', destination: 'https://google.com' },
        { domain: 'foo1.booboo.xyz', destination: 'https://duck.com' },
      ];
      const zone = async () => zones;
      const redir = async () => redirections;
      const mockDomainService = getDomainService({ cpanel: getCpanel({ zone, redir }) });
      const list = await mockDomainService.getHosts();

      expect(list).toEqual([
        { name: 'xx', type: 'CNAME', address: 'fck.com' },
        { name: 'xx', type: 'A', address: '111.1.1212.1' },
        { name: 'foo', type: 'URL', address: 'https://google.com' },
        { name: 'foo1', type: 'URL', address: 'https://duck.com' },
      ]);
    });
  });

  describe('setHosts', () => {
    it('should resolve with a list of hosts', async () => {
      const records = [
        { name: 'xx', type: 'CNAME', address: 'fck.com' },
        { name: 'xx', type: 'A', address: '111.1.1212.1' },
        { name: 'foo', type: 'URL', address: 'https://google.com' },
        { name: 'foo1', type: 'URL', address: 'https://duck.com' },
      ];

      const setZone = jest.fn(async () => {});
      const setRedir = jest.fn(async () => {});

      const mockDomainService = getDomainService({ cpanel: getCpanel({ setZone, setRedir }) });
      await mockDomainService.setHosts(records);

      expect(setZone).toBeCalledTimes(2);
      expect(setRedir).toBeCalledTimes(2);
      expect(setZone.mock.calls.map(R.head)).toEqual([
        { name: 'xx', type: 'CNAME', address: 'fck.com' },
        { name: 'xx', type: 'A', address: '111.1.1212.1' },
      ]);
      expect(setRedir.mock.calls.map(R.head)).toEqual([
        {
          domain: 'foo.booboo.xyz',
          redirect: 'https://google.com',
          redirect_wildcard: 1,
          redirect_www: 0,
          type: 'permanent',
        },
        {
          domain: 'foo1.booboo.xyz',
          redirect: 'https://duck.com',
          redirect_wildcard: 1,
          redirect_www: 0,
          type: 'permanent',
        },
      ]);
    });
  });

  describe('updateHosts', () => {
    return;

    it('should append new hosts with existing ones and set it', async () => {
      const zones = [
        { HostId: 1, name: 'a', type: 'CNAME', address: 'boo' },
        { HostId: 2, name: 'b', type: 'CNAME', address: 'goo' },
      ];
      const redirections = [];

      const mockDomainService = mockDS({ zones, redirections });;
      await mockDomainService.updateHosts([
        { name: 'a', type: 'CNAME', address: 'boo' },
        { name: 'b', type: 'CNAME', address: 'goo' },
        { name: 'c', type: 'A', address: '12.131321.213' },
      ]);

      expect(setZone).toBeCalledTimes(1);
      expect(getZoneCalls()).toEqual([
        { name: 'c', type: 'A', address: '12.131321.213' },
      ]);
    });

    it('should update matching host and set it', async () => {
      const zones = [
        { HostId: 1, Name: 'a', Type: 'CNAME', address: 'boo' },
        { HostId: 2, Name: 'b', Type: 'CNAME', address: 'goo' },
      ];
      const redirections = [];

      const mockDomainService = mockDS({ zones, redirections });;
      await mockDomainService.updateHosts([
        { name: 'a', type: 'CNAME', address: 'boo' },
        { name: 'b', type: 'CNAME', address: 'googoogaga' },
      ]);

      expect(setZone).toBeCalledTimes(2);
      expect(getZoneCalls()).toEqual([
        { name: 'a', type: 'CNAME', address: 'boo' },
        { name: 'b', type: 'CNAME', address: 'googoogaga' },
      ]);
    });
    return;

    it('should update matching host and set it', async () => {
      const records = [
        { HostId: 1, Name: 'a', Type: 'CNAME', address: 'boo' },
        { HostId: 2, Name: 'b', Type: 'CNAME', address: 'goo' },
        { HostId: 2, Name: 'b', Type: 'CNAME', address: 'xaa' },
      ];

      const onGet = () => Promise.resolve({ hosts: records });
      const onSet = jest.fn(async () => ({}));

      const mockDomainService = getDomainService({ cpanel: getCpanel({ onSet, onGet }) });
      await mockDomainService.updateHosts([
        { name: 'a', type: 'CNAME', address: 'boo' },
        { name: 'b', type: 'CNAME', address: 'googoogaga' },
        { name: 'b', type: 'CNAME', address: 'farboo' },
      ]);

      const [hosts] = onSet.mock.calls[0];

      expect(hosts.map(R.pick(['name', 'type', 'address']))).toEqual([
        { name: 'a', type: 'CNAME', address: 'boo' },
        { name: 'b', type: 'CNAME', address: 'googoogaga' },
        { name: 'b', type: 'CNAME', address: 'farboo' },
      ]);
    });
  });
});

