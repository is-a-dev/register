const R = require('ramda');
const { getDomainService } = require('../utils/domain-service');

const getCpanel = ({ zone, redir, setZone, setRedir } = {}) => ({
  addZoneRecord: (rec) => setZone(rec),
  addRedirection: (rec) => setRedir(rec),
  fetchZoneRecords: (_) => zone(),
  fetchRedirections: (_) => redir(),
});

describe('Domain service', () => {
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

  return;

  describe('updateHosts', () => {
    it('should append new hosts with existing ones and set it', async () => {
      const records = [
        { HostId: 1, Name: 'a', Type: 'CNAME', Address: 'boo' },
        { HostId: 2, Name: 'b', Type: 'CNAME', Address: 'goo' },
      ];

      const onGet = () => Promise.resolve({ hosts: records });
      const onSet = jest.fn(async () => ({}));

      const mockDomainService = getDomainService({ cpanel: getCpanel({ onSet, onGet }) });
      await mockDomainService.updateHosts([
        { HostName: 'a', RecordType: 'CNAME', Address: 'boo' },
        { HostName: 'b', RecordType: 'CNAME', Address: 'goo' },
        { HostName: 'c', RecordType: 'A', Address: '12.131321.213' },
      ]);

      const [hosts] = onSet.mock.calls[0];

      expect(hosts.map(R.pick(['HostName', 'RecordType', 'Address']))).toEqual([
        { HostName: 'a', RecordType: 'CNAME', Address: 'boo' },
        { HostName: 'b', RecordType: 'CNAME', Address: 'goo' },
        { HostName: 'c', RecordType: 'A', Address: '12.131321.213' },
      ]);
    });

    it('should update matching host and set it', async () => {
      const records = [
        { HostId: 1, Name: 'a', Type: 'CNAME', Address: 'boo' },
        { HostId: 2, Name: 'b', Type: 'CNAME', Address: 'goo' },
      ];

      const onGet = () => Promise.resolve({ hosts: records });
      const onSet = jest.fn(async () => ({}));

      const mockDomainService = getDomainService({ cpanel: getCpanel({ onSet, onGet }) });
      await mockDomainService.updateHosts([
        { HostName: 'a', RecordType: 'CNAME', Address: 'boo' },
        { HostName: 'b', RecordType: 'CNAME', Address: 'googoogaga' },
      ]);

      const [hosts] = onSet.mock.calls[0];

      expect(hosts.map(R.pick(['HostName', 'RecordType', 'Address']))).toEqual([
        { HostName: 'a', RecordType: 'CNAME', Address: 'boo' },
        { HostName: 'b', RecordType: 'CNAME', Address: 'googoogaga' },
      ]);
    });

    it('should update matching host and set it', async () => {
      const records = [
        { HostId: 1, Name: 'a', Type: 'CNAME', Address: 'boo' },
        { HostId: 2, Name: 'b', Type: 'CNAME', Address: 'goo' },
        { HostId: 2, Name: 'b', Type: 'CNAME', Address: 'xaa' },
      ];

      const onGet = () => Promise.resolve({ hosts: records });
      const onSet = jest.fn(async () => ({}));

      const mockDomainService = getDomainService({ cpanel: getCpanel({ onSet, onGet }) });
      await mockDomainService.updateHosts([
        { HostName: 'a', RecordType: 'CNAME', Address: 'boo' },
        { HostName: 'b', RecordType: 'CNAME', Address: 'googoogaga' },
        { HostName: 'b', RecordType: 'CNAME', Address: 'farboo' },
      ]);

      const [hosts] = onSet.mock.calls[0];

      expect(hosts.map(R.pick(['HostName', 'RecordType', 'Address']))).toEqual([
        { HostName: 'a', RecordType: 'CNAME', Address: 'boo' },
        { HostName: 'b', RecordType: 'CNAME', Address: 'googoogaga' },
        { HostName: 'b', RecordType: 'CNAME', Address: 'farboo' },
      ]);
    });
  });
});

