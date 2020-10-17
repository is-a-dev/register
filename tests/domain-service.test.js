const R = require('ramda');
const { getDomainService, diffRecords } = require('../utils/domain-service');
const {DOMAIN_DOMAIN} = require('../utils/constants');

const getCpanel = ({ zone, addZone, removeZone, redir, addRedir, removeRedir } = {}) => ({
  zone: {
    fetch: (_) => zone(),
    add: (rec) => addZone(rec),
    remove: (rec) => removeZone(rec),
  },
  redirection: {
    fetch: (_) => redir(),
    add: (rec) => addRedir(rec),
    remove: (rec) => removeRedir(rec),
  },
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
      remove: [],
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
      remove: [
        { name: 'xa', type: 'A', address: '111.1.1212.1' },
      ],
      add: [
        { name: 'xa', type: 'A', address: '69.69.69.69' },
      ],
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
      remove: [],
      add: [
        { name: 'xa', type: 'A', address: '69.69.4.20' },
      ],
    });
  });

  it('should diff complex changes', () => {
    const oldRecords = [
      { name: 'a', type: 'CNAME', address: 'fck.com.' },
      { name: 'b', type: 'A', address: '69.69.69.69' },
      { name: '111', type: 'CNAME', address: 'x' },
      { name: 'd', type: 'A', address: '69.69.4.20' },
    ];
    const newRecords = [
      { name: '111', type: 'CNAME', address: 'x' },
      { name: 'd', type: 'CNAME', address: 'duck.com' },
      { name: 'a', type: 'CNAME', address: 'og.com' },
      { name: 'b', type: 'A', address: '69.69.69.69' },
      { name: 'b', type: 'A', address: '69.69.4.20' },
      { name: 'c', type: 'CNAME', address: 'ccc.cc' },
    ];

    const result = diffRecords(oldRecords, newRecords);
    expect(result).toEqual({
      remove: [
        { name: 'a', type: 'CNAME', address: 'fck.com.' },
        { name: 'd', type: 'A', address: '69.69.4.20' },
      ],
      add: [
        { name: 'd', type: 'CNAME', address: 'duck.com' },
        { name: 'a', type: 'CNAME', address: 'og.com' },
        { name: 'b', type: 'A', address: '69.69.4.20' },
        { name: 'c', type: 'CNAME', address: 'ccc.cc' },
      ],
    });
  });
});

describe('Domain service', () => {
  const addZone = jest.fn(async () => ({}));
  const removeZone = jest.fn(async () => ({}));
  const addRedir = jest.fn(async () => ({}));
  const removeRedir = jest.fn(async () => ({}));

  const mockDS = ({ zones, redirections }) => getDomainService({ cpanel: getCpanel({
    zone: async () => zones,
    redir: async () => redirections,
    addZone,
    addRedir,
    removeZone,
    removeRedir,
  }) });

  const getRecordCalls = recfn => recfn.mock.calls.map(R.head).map(R.pick(['name', 'type', 'address', 'redirect', 'domain', 'line']));

  beforeEach(() => {
    addZone.mockClear();
    removeZone.mockClear();
    addRedir.mockClear();
    removeRedir.mockClear();
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
        { line: '111', name: 'xx', type: 'CNAME', address: 'fck.com.' },
        { line: '112', name: 'xx', type: 'A', address: '111.1.1212.1' },
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
        { id: '111', name: 'xx', type: 'CNAME', address: 'fck.com' },
        { id: '112', name: 'xx', type: 'A', address: '111.1.1212.1' },
        { id: `foo.${DOMAIN_DOMAIN}`, name: 'foo', type: 'URL', address: 'https://google.com' },
        { id: `foo1.${DOMAIN_DOMAIN}`, name: 'foo1', type: 'URL', address: 'https://duck.com' },
      ]);
    });
  });

  describe('updateHosts', () => {
    it('should append new hosts with existing ones and set it', async () => {
      const zones = [
        { line: 1, name: 'a', type: 'CNAME', address: 'boo' },
        { line: 2, name: 'b', type: 'CNAME', address: 'goo' },
      ];
      const redirections = [];

      const mockDomainService = mockDS({ zones, redirections });
      await mockDomainService.updateHosts([
        { name: 'a', type: 'CNAME', address: 'boo' },
        { name: 'b', type: 'CNAME', address: 'goo' },
        { name: 'c', type: 'A', address: '12.131321.213' },
      ]);

      expect(addZone).toBeCalledTimes(1);
      expect(getRecordCalls(addZone)).toEqual([
        { name: 'c', type: 'A', address: '12.131321.213' },
      ]);
      expect(removeZone).toBeCalledTimes(0);
    });

    it('should update matching host and set it', async () => {
      const zones = [
        { line: 1, name: 'a', type: 'CNAME', address: 'boo' },
        { line: 2, name: 'b', type: 'CNAME', address: 'goo' },
      ];
      const redirections = [];

      const mockDomainService = mockDS({ zones, redirections });
      await mockDomainService.updateHosts([
        { name: 'a', type: 'CNAME', address: 'boo' },
        { name: 'b', type: 'CNAME', address: 'googoogaga' },
      ]);

      expect(addZone).toBeCalledTimes(1);
      expect(getRecordCalls(addZone)).toEqual([
        { name: 'b', type: 'CNAME', address: 'googoogaga' },
      ]);
      expect(removeZone).toBeCalledTimes(1);
      expect(getRecordCalls(removeZone)).toEqual([
        { line: 2 },
      ]);
    });

    it('should update matching host and set it', async () => {
      const zones = [
        { line: 1, name: 'a', type: 'CNAME', address: 'boo' },
        { line: 2, name: 'b', type: 'CNAME', address: 'goo' },
        { line: 3, name: 'b', type: 'CNAME', address: 'xaa' },
      ];
      const redirections = [];

      const mockDomainService = mockDS({ zones, redirections });
      await mockDomainService.updateHosts([
        { name: 'a', type: 'CNAME', address: 'boo' },
        { name: 'b', type: 'CNAME', address: 'googoogaga' },
        { name: 'b', type: 'CNAME', address: 'farboo' },
      ]);

      expect(addZone).toBeCalledTimes(2);
      expect(getRecordCalls(addZone)).toEqual([
        { name: 'b', type: 'CNAME', address: 'googoogaga' },
        { name: 'b', type: 'CNAME', address: 'farboo' },
      ]);
      expect(removeZone).toBeCalledTimes(2);
      expect(getRecordCalls(removeZone)).toEqual([
        { line: 2 },
        { line: 3 },
      ]);
    });

    it('should workout this complex example', async () => {
      const zones = [
        { line: 1, name: 'a', type: 'CNAME', address: 'world' },
        { line: 2, name: 'b', type: 'A', address: '1' },
        { line: 3, name: 'b', type: 'A', address: '2' },
        { line: 4, name: 'c', type: 'CNAME', address: 'hello.com' },
      ];
      const redirections = [
        { domain: `b.${DOMAIN_DOMAIN}`, destination: 'https://foobar.com' },
        { domain: `c.${DOMAIN_DOMAIN}`, destination: 'https://goobar.com' },
        { domain: `x.${DOMAIN_DOMAIN}`, destination: 'https://example.com' },
      ];

      const mockDomainService = mockDS({ zones, redirections });
      await mockDomainService.updateHosts([
        { name: 'a', type: 'CNAME', address: 'boo' },
        { name: 'b', type: 'A', address: '1' },
        { name: 'b', type: 'A', address: '2' },
        { name: 'b', type: 'A', address: '3' },
        { name: 'b', type: 'URL', address: 'https://wowow.com' },
        { name: 'c', type: 'CNAME', address: 'hello.com' },
        { name: 'c', type: 'URL', address: 'https://goobar.com' },
        { name: 'd', type: 'CNAME', address: 'helo.com' },
        { name: 'd', type: 'URL', address: 'https://hhh.com' },
        { name: 'x', type: 'URL', address: 'https://example69.com' },
      ]);

      expect(addZone).toBeCalledTimes(3);
      expect(getRecordCalls(addZone)).toEqual([
        { name: 'a', type: 'CNAME', address: 'boo' },
        { name: 'b', type: 'A', address: '3' },
        { name: 'd', type: 'CNAME', address: 'helo.com' },
      ]);
      expect(removeZone).toBeCalledTimes(1);
      expect(getRecordCalls(removeZone)).toEqual([
        { line: 1 },
      ]);
      expect(addRedir).toBeCalledTimes(3);
      expect(getRecordCalls(addRedir)).toEqual([
        { domain: `b.${DOMAIN_DOMAIN}`, type: 'permanent', redirect: 'https://wowow.com' },
        { domain: `d.${DOMAIN_DOMAIN}`, type: 'permanent', redirect: 'https://hhh.com' },
        { domain: `x.${DOMAIN_DOMAIN}`, type: 'permanent', redirect: 'https://example69.com' },
      ]);
      expect(removeRedir).toBeCalledTimes(2);
      expect(getRecordCalls(removeRedir)).toEqual([
        { domain: `b.${DOMAIN_DOMAIN}` },
        { domain: `x.${DOMAIN_DOMAIN}` },
      ]);
    });
  });
});

