const R = require('ramda');
const { getDomainService } = require('../utils/domain-service');

const getNcClass = ({ onSet, onGet } = {}) => class Namecheap {
  dns = {
    setHosts: (_, list) => onSet(list),
    getHosts: (_) => onGet(),
  };
};

describe('Domain service', () => {
  describe('getHosts', () => {
    it('should resolve with a list of hosts', async () => {
      const hosts = [
        { Name: 'xx', Type: 'CNAME', Address: 'fck.com.' },
        { Name: 'xx', Type: 'A', Address: '111.1.1212.1' },
      ];
      const onGet = async () => ({ hosts })
      const mockDomainService = getDomainService({ Namecheap: getNcClass({ onGet }) });
      const list = await mockDomainService.getHosts();

      expect(list).toEqual([
        { HostName: 'xx', RecordType: 'CNAME', Address: 'fck.com' },
        { HostName: 'xx', RecordType: 'A', Address: '111.1.1212.1' },
      ]);
    });
  });

  describe('setHosts', () => {
    it('should resolve with a list of hosts', async () => {
      const records = [ { x: 'y' }, { z: 'a' } ];

      const onSet = jest.fn((list) => {
        expect(list).toBe(records);
        return Promise.resolve(null);
      });

      const mockDomainService = getDomainService({ Namecheap: getNcClass({ onSet }) });
      await mockDomainService.setHosts(records);
      expect(onSet).toBeCalledTimes(1);
    });
  });

  describe('updateHosts', () => {
    it('should append new hosts with existing ones and set it', async () => {
      const records = [
        { HostId: 1, Name: 'a', Type: 'CNAME', Address: 'boo' },
        { HostId: 2, Name: 'b', Type: 'CNAME', Address: 'goo' },
      ];

      const onGet = () => Promise.resolve({ hosts: records });
      const onSet = jest.fn(async () => ({}));

      const mockDomainService = getDomainService({ Namecheap: getNcClass({ onSet, onGet }) });
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

      const mockDomainService = getDomainService({ Namecheap: getNcClass({ onSet, onGet }) });
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

      const mockDomainService = getDomainService({ Namecheap: getNcClass({ onSet, onGet }) });
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

    xit('should maintain existing entries on the server', async () => {
      const records = [
        { HostId: 1, Name: 'a', Type: 'CNAME', Address: 'boo' },
        { HostId: 2, Name: 'b', Type: 'CNAME', Address: 'goo' },
        { HostId: 3, Name: 'c', Type: 'A', Address: '12.131321.213' },
      ];

      const onGet = () => Promise.resolve({ hosts: records });
      const onSet = jest.fn(async () => ({}));

      const mockDomainService = getDomainService({ Namecheap: getNcClass({ onSet, onGet }) });
      await mockDomainService.updateHosts([
        { HostName: 'a', RecordType: 'CNAME', Address: 'boo' },
        { HostName: 'b', RecordType: 'CNAME', Address: 'goo' },
      ]);

      const [hosts] = onSet.mock.calls[0];

      expect(hosts.map(R.pick(['HostName', 'RecordType', 'Address']))).toEqual([
        { HostName: 'a', RecordType: 'CNAME', Address: 'boo' },
        { HostName: 'b', RecordType: 'CNAME', Address: 'goo' },
        { HostName: 'c', RecordType: 'A', Address: '12.131321.213' },
      ]);
      expect();
      // expect(onSet).toBeCalledTimes(1);
    });
  });
});

