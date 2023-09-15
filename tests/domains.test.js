const R = require('ramda');
const fs = require('fs');
const { getDomains } = require('../utils/get-domain');
const { validateDomainData } = require('../utils/validations');
const { DOMAINS_PATH } = require('../utils/constants');

describe('Domains', () => {
  it('should all be json', async () => {
    const files = await fs.promises.readdir(DOMAINS_PATH, {});
    expect(files.filter(f => !/\.json$/g.test(f)).length).toBe(0);
  });

  it('should be valid', (done) => {
    getDomains()
      .then(R.reject(R.propEq('name', '_psl')))
      .then(R.map(data => {
        const { errors } = validateDomainData(data);
        if (errors.length) {
          const message = errors
            .map(([key, { reason }]) => `[${data.name}.${key}]: ${reason}`)
            .join('\n');
          return `\nValidation errors in ${data.name}.json: \n${message}`;
        }
        return '';
      }))
      .then(R.filter(R.complement(R.isEmpty)))
      .then(messages => messages.length ? done(messages.join('\n')) : done())
      .catch(done);
  });
});

