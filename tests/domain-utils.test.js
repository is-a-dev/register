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
  record: { A: ['121.121.121.121'] },
};

describe('validateDomainData', () => {
  const invalidCases = [
    {},
    { forceHttps: false },
    { forceHttps: 1 },
    { name: 'helo' },
    { record: { CNAME: ['sd'] } },
    { name: 'wwow', record: { A: ['12312'] } },
    ...['', ' ', undefined, 'hello world', 'good12312++123', 'ajsdjasdaSD_123yuqehq', 'khsda%', '12112**dsd', Array(101).fill('a').join('')]
    .map(name => ({
      ...defaultDomain,
      name,
    })),
    {
      ...defaultDomain,
      description: Array(201).fill('a').join(''),
    },
  ];

  const validCases = [
    defaultDomain,
    ...['hello', 'hello-world', '11111111111', '--wow--', 'wow--', '--wow'].map(name => ({
      ...defaultDomain,
      name,
    })),
    {
      ...defaultDomain,
      description: Array(99).fill('a').join(''),
    },
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
      expect(valid).toBe(true);
      expect(errors).toEqual([]);
    });
  });
});

