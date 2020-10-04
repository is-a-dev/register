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

    describe('isValidDomainData', () => {
      it('should return true for a valid object', () => {
        const { valid, errors } = validateDomainData({
          forceHttps: true,
          record: { CNAME: ['hello.com'] },
        });
        expect(valid).toBe(true);
        expect(errors).toEqual([]);
      });
    });
  });

  xit('should have a the correct keys', async () => {
    const list = await getDomains();
    list.forEach(data => {
      const { errors } = validateDomainData(data);
      if (errors.length) {
        console.log(errors);
      }
    });
  });
});

