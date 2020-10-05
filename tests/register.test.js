const { toHostList, registerDomains } = require('../scripts/register-domains');
const { TTL } = require('../utils/constants');
const { getDomainService } = require('../utils/domain-service');

const getNc = ({ onSet, onGet } = {}) => ({
  dns: {
    setHosts: (_, list) => onSet(list),
    getHosts: (_) => onGet(),
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
      { HostName: 'akshay', RecordType: 'CNAME', Address: 'phenax.github.io', TTL },
      { HostName: 'foobar', RecordType: 'CNAME', Address: 'v.io', TTL },
      { HostName: 'xx', RecordType: 'A', Address: '1.2.3.4', TTL },
      { HostName: 'xx', RecordType: 'A', Address: '5.6.3.2', TTL },
      { HostName: 'xx', RecordType: 'A', Address: '1.2.31.1', TTL },
    ]);
  });
});

describe('registerDomains', () => {
  it('should register the new set of hosts generated from domains list', async () => {
    const localHosts = [
      { name: 'a', record: { CNAME: 'hello' } },
      { name: 'b', record: { CNAME: 'xaa' } },
    ];
    const remoteHosts = [
      { HostId: 1, Name: 'a', Type: 'CNAME', Address: 'boo' },
      { HostId: 2, Name: 'b', Type: 'CNAME', Address: 'goo' },
      { HostId: 2, Name: 'b', Type: 'CNAME', Address: 'xaa' },
    ];

    const onSet = jest.fn(async () => ({}));

    const domainService = getDomainService({ nc: getNc({ onSet, onGet: async () => ({ hosts: remoteHosts }) }) });
    await registerDomains({ getDomains: async () => localHosts, domainService });

    expect(onSet).toBeCalledTimes(1);

    const [hosts] = onSet.mock.calls[0];
    expect(hosts).toEqual([
      { HostId: 1, Address: 'hello', HostName: 'a', RecordType: 'CNAME', TTL },
      { HostId: 2, Address: 'xaa', HostName: 'b', RecordType: 'CNAME', TTL },
    ]);
  });

  it('should add the new set hosts', async () => {
    const localHosts = [
      { name: 'a', record: { CNAME: 'boo' } },
      { name: 'b', record: { CNAME: 'xaa' } },
      { name: 'c', record: { CNAME: 'yello' } },
    ];
    const remoteHosts = [
      { HostId: 1, Name: 'a', Type: 'CNAME', Address: 'boo' },
      { HostId: 2, Name: 'b', Type: 'CNAME', Address: 'xaa' },
    ];

    const onSet = jest.fn(async () => ({}));

    const domainService = getDomainService({ nc: getNc({ onSet, onGet: async () => ({ hosts: remoteHosts }) }) });
    await registerDomains({ getDomains: async () => localHosts, domainService });

    expect(onSet).toBeCalledTimes(1);

    const [hosts] = onSet.mock.calls[0];
    expect(hosts).toEqual([
      { HostId: 1, Address: 'boo', HostName: 'a', RecordType: 'CNAME', TTL },
      { HostId: 2, Address: 'xaa', HostName: 'b', RecordType: 'CNAME', TTL },
      { Address: 'yello', HostName: 'c', RecordType: 'CNAME', TTL },
    ]);
  });

  it('should remove unlisted hosts', async () => {
    const localHosts = [
      { name: 'a', record: { CNAME: 'boo' } },
    ];
    const remoteHosts = [
      { HostId: 1, Name: 'a', Type: 'CNAME', Address: 'boo' },
      { HostId: 2, Name: 'b', Type: 'CNAME', Address: 'xaa' },
    ];

    const onSet = jest.fn(async () => ({}));

    const domainService = getDomainService({ nc: getNc({ onSet, onGet: async () => ({ hosts: remoteHosts }) }) });
    await registerDomains({ getDomains: async () => localHosts, domainService });

    expect(onSet).toBeCalledTimes(1);

    const [hosts] = onSet.mock.calls[0];
    expect(hosts).toEqual([
      { HostId: 1, Address: 'boo', HostName: 'a', RecordType: 'CNAME', TTL },
    ]);
  });

  it('should change record type from cname to a', async () => {
    const localHosts = [
      { name: 'a', record: { CNAME: 'boo' } },
      { name: 'b', record: { A: ['1', '2', '3'] } },
    ];
    const remoteHosts = [
      { HostId: 1, Name: 'a', Type: 'CNAME', Address: 'boo' },
      { HostId: 2, Name: 'b', Type: 'CNAME', Address: 'xaa' },
    ];

    const onSet = jest.fn(async () => ({}));

    const domainService = getDomainService({ nc: getNc({ onSet, onGet: async () => ({ hosts: remoteHosts }) }) });
    await registerDomains({ getDomains: async () => localHosts, domainService });

    expect(onSet).toBeCalledTimes(1);

    const [hosts] = onSet.mock.calls[0];
    expect(hosts).toEqual([
      { HostId: 1, Address: 'boo', HostName: 'a', RecordType: 'CNAME', TTL },
      { Address: '1', HostName: 'b', RecordType: 'A', TTL },
      { Address: '2', HostName: 'b', RecordType: 'A', TTL },
      { Address: '3', HostName: 'b', RecordType: 'A', TTL },
    ]);
  });
});

