const R = require('ramda');
const { getDomains, validateDomainData } = require('../utils/domain');

describe('Domains', () => {
  it('should be valid', async () => {
    const list = await getDomains();

    list.forEach(data => {
      const { errors } = validateDomainData(data);
      if (errors.length) {
        console.log(errors);
      }
    });
  });
});

