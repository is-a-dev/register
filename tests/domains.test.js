const R = require('ramda');
const { getDomains, validateDomainData } = require('../utils/domain');

describe('Domains', () => {
  describe('but first... a test for this test', () => {
    describe('getDomains', () => {
      it('should resolve with the list of domains', async () => {
        const list = await getDomains();
        expect(Array.isArray(list)).toBe(true);
      });
    });

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
            name,
            forceHttps: true,
            record: { CNAME: ['hello.com'] },
          })),
      ];

      const validCases = [
        { name: 'asas', forceHttps: false, record: { A: ['111.111.111.111'] } },
        ...['hello', 'hello-world', '11111111111', '--wow--', 'wow--', '--wow'].map(name => ({
          name,
          forceHttps: true,
          record: { CNAME: ['hello.com'] },
        }))
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
  });

  it('should have a the correct keys', async () => {
    const list = await getDomains();
    list.forEach(data => {
      const { errors } = validateDomainData(data);
      if (errors.length) {
        console.log(errors);
      }
    });
  });
});

