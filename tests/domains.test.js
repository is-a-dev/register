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
      it('should return true if the name is invalid', () => {
        const { valid, errors } = validateDomainData({
          name: 'hello world',
          forceHttps: true,
          record: { CNAME: ['hello.com'] },
        });
        expect(valid).toBe(false);
        expect(errors[0][0]).toBe('name');
      });

      it('should return true for a valid object', () => {
        const { valid, errors } = validateDomainData({
          name: 'something',
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

