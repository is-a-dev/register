const { validateDomainData } = require('../utils/validations');

const defaultDomain = {
  name: 'aaa',
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
    { name: 'helo' },
    { name: 'wwow', record: { A: ['12312'] } },
    ...['', ' ', undefined, 'hlo wld', 'g32++13', 'ajsdD_123yq', 'khsda%', '122*dsd', getstroflen(101)].map(name => ({
      ...defaultDomain,
      name,
    })),
    { ...defaultDomain, record: { CNAME: 'sd', A: ['121,3213'] } },
    { ...defaultDomain, record: { A: ['121', '12'], FOOBAR: ['sd'] } },
    { ...defaultDomain, record: { A: [] } },
    { ...defaultDomain, record: { A: ['11122'], URL: 'foobar' } },
    { ...defaultDomain, owner: {}, },
    { ...defaultDomain, owner: { username: 'hwelo', }, },
    { ...defaultDomain, owner: { email: 'hwelo' }, },
    { ...defaultDomain, record: { CNAME: 'http://foobar.com' } },
    { ...defaultDomain, record: { CNAME: 'https://foobar.com' } },
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
    { ...defaultDomain, record: { CNAME: 'aa.sd', URL: '121,3213' } },
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

