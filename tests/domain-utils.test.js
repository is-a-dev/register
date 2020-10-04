const { getDomains, validateDomainData } = require('../utils/domain');

describe('getDomains', () => {
  it('should resolve with the list of domains', async () => {
    const list = await getDomains();
    expect(Array.isArray(list)).toBe(true);
  });
});

const defaultDomain = {
  name: 'aaa',
  forceHttps: false,
  record: {
    A: ['121.121.121.121']
  },
  owner: {
    username: 'betsy',
    email: 'betsyfuckyoassup@foobar.com',
  },
};

const getstroflen = len => Array(len).fill('a').join('');

describe('validateDomainData', () => {
  const invalidCases = [
    {},
    { forceHttps: false },
    { forceHttps: 1 },
    { name: 'helo' },
    { name: 'wwow', record: { A: ['12312'] } },
    ...['', ' ', undefined, 'hlo wld', 'g32++13', 'ajsdD_123yq', 'khsda%', '122*dsd', getstroflen(101)].map(name => ({
      ...defaultDomain,
      name,
    })),
    { ...defaultDomain, record: { CNAME: 'sd', A: ['121,3213'] } },
    //{ ...defaultDomain, record: { FOOBAR: ['sd'] } },
    { ...defaultDomain, owner: {}, },
    { ...defaultDomain, owner: { username: 'hwelo', }, },
    { ...defaultDomain, owner: { email: 'hwelo' }, },
  ];

  const validCases = [
    defaultDomain,
    ...['hello', 'hello-world', '11111111111', '--wow--', 'wow--', '--wow'].map(name => ({
      ...defaultDomain,
      name,
    })),
    {
      ...defaultDomain,
      description: getstroflen(99),
    },
    { ...defaultDomain, record: { CNAME: 'sd', URL: '121,3213' } },
  ];

  it('should return false for invalid data', () => {
    invalidCases.forEach(data => {
      const { valid, errors } = validateDomainData(data);
      expect(valid).toBe(false);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  it('should return true if the name is valid', () => {
    validCases.forEach(data => {
      const { valid, errors } = validateDomainData(data);
      if (!valid) console.log(errors);
      expect(valid).toBe(true);
      expect(errors).toEqual([]);
    });
  });
});

