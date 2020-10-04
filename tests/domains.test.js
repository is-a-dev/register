const R = require('ramda');
const { getDomains, validateDomainData } = require('../utils/domain');

describe('Domains', () => {
  it('should be valid', (done) => {
    getDomains()
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

