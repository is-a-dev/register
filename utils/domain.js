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
  //name: {
    //reason: 'The name of the file is invalid',
    //fn: R.match(/[A-Za-z0-9]{3,}/g),
  //},
  description: {
    reason: 'Description has to be shorter than 100 characters',
    fn: R.anyPass([
      R.empty,
      hasLengthLessThan(100),
    ]),
  },
  forceHttps: {
    reason: 'forceHttp is required to be true or false',
    fn: R.is(Boolean),
  },
  record: {
    reason: 'Invalid record',
    fn: R.allPass([
      R.is(Object),
      R.anyPass([
        R.propSatisfies(R.is(Array), 'CNAME'),
        R.propSatisfies(R.is(Array), 'A'),
      ]),
      R.compose(hasLengthLessThan(1), R.keys),
    ]),
  },
});

module.exports = { getDomains, validateDomainData };
