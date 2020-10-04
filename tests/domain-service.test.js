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
});

