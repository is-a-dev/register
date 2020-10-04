const fs = require('fs');
const path = require('path');
const R = require('ramda');

const DOMAINS_PATH = path.resolve('domains');

const toDomain = str => path.join(DOMAINS_PATH, str);

const toDomainData = R.compose(require, toDomain);

const getDomains = () =>
  fs.promises.readdir(DOMAINS_PATH, {})
    .then(R.map(name => ({
      ...toDomainData(name),
      name: name.replace(/\.json$/, ''),
    })));

const hasLengthLessThan = len => R.compose(R.not, R.lt(len), R.length);

const validate = pattern => data => R.compose(
  invalidPairs => invalidPairs.length ? { errors: invalidPairs, valid: false } : { errors: [], valid: true },
  R.filter(([key, { fn }]) => fn ? !fn(data[key]) : false),
  R.toPairs,
)(pattern);

const validateDomainData = validate({
  name: {
    reason: 'The name of the file is invalid',
    fn: R.allPass([
      hasLengthLessThan(100),
      str => str && str.match(/^[A-Za-z0-9\-]{2,}$/ig),
    ]),
  },
  description: { reason: '', fn: R.T, },
  repo: { reason: '', fn: R.T, },
  owner: {
    reason: '`owner` needs username and email properties',
    fn: R.allPass([
      R.is(Object),
      R.complement(R.isEmpty),
      R.where({
        username: R.is(String),
        email: R.is(String),
      }),
    ]),
  },
  forceHttps: {
    reason: '`forceHttp` is required to be true or false',
    fn: R.is(Boolean),
  },
  record: {
    reason: 'Invalid record',
    fn: R.allPass([
      R.is(Object),
      R.compose(hasLengthLessThan(1), R.keys),
      R.anyPass([
        R.propSatisfies(R.is(Array), 'CNAME'),
        R.propSatisfies(R.is(Array), 'A'),
      ]),
    ]),
  },
});

module.exports = { getDomains, validateDomainData };
