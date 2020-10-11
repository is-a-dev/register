const fs = require('fs');
const path = require('path');
const R = require('ramda');
const { VALID_RECORD_TYPES, DOMAINS_PATH } = require('./constants');

const log = m => x => console.log(m, x) || x;

const toDomain = str => path.join(DOMAINS_PATH, str);

const toDomainData = R.compose(require, toDomain);

const getDomains = () =>
  fs.promises.readdir(DOMAINS_PATH, {})
    .then(R.map(name => ({
      ...toDomainData(name),
      name: name.replace(/\.json$/, ''),
    })));

const between = (min, max) => num => num >= min && num <= max;

const validate = pattern => data => R.compose(
  invalidPairs => invalidPairs.length ? { errors: invalidPairs, valid: false } : { errors: [], valid: true },
  R.filter(([key, { fn }]) => fn ? !fn(data[key]) : false),
  R.toPairs,
)(pattern);

const validateNameRecord = type => R.allPass([
  R.compose(R.equals(1), R.length, R.reject(R.equals('URL')), R.keys),
  R.propSatisfies(R.is(String), type),
]);

const validateDomainData = validate({
  name: {
    reason: 'The name of the file is invalid',
    fn: R.anyPass([
      R.equals('@'),
      R.allPass([
        R.compose(between(2, 100), R.length),
        str => str && str.match(/^[A-Za-z0-9\-]+$/ig),
      ])
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
  record: {
    reason: 'Invalid record',
    fn: R.allPass([
      R.is(Object),
      R.compose(R.isEmpty, R.flip(R.difference)(VALID_RECORD_TYPES), R.keys),
      R.cond([
        [R.prop('CNAME'),  validateNameRecord('CNAME')],
        [R.prop('A'),      R.propSatisfies(R.is(Array), 'A')],
        [R.prop('URL'),    R.propSatisfies(R.is(String), 'URL')],
        [R.T, R.T],
      ]),
    ]),
  },
});

module.exports = { getDomains, validateDomainData };
