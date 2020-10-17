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
const testRegex = regex => str => !!(str && str.match(regex));

const validate = pattern => data => R.compose(
  invalidPairs => invalidPairs.length ? { errors: invalidPairs, valid: false } : { errors: [], valid: true },
  R.filter(([key, { fn }]) => fn ? !fn(data[key]) : false),
  R.toPairs,
)(pattern);

const or = R.anyPass;
const and = R.allPass;

const validateCnameRecord = key => and([
  R.propSatisfies(R.is(String), key),
  R.compose(R.equals(1), R.length, R.reject(R.equals('URL')), R.keys),
  R.propSatisfies(R.compose(R.gte(R.__, 3), R.length), key),
  R.propSatisfies(R.complement(testRegex(/^https?:\/\//ig)), key),
]);

const validateARecord = key => and([
  R.compose(R.equals(1), R.length, R.keys),
  R.propSatisfies(R.compose(R.gte(R.__, 1), R.length), key),
]);

const validateDomainData = validate({
  name: {
    reason: 'The name of the file is invalid',
    fn: or([
      R.equals('@'),
      and([
        R.compose(between(2, 100), R.length),
        testRegex(/^[a-z0-9\-]+$/g),
      ])
    ]),
  },
  description: { reason: '', fn: R.T, },
  repo: { reason: '', fn: R.T, },
  owner: {
    reason: '`owner` needs username and email properties',
    fn: and([
      R.is(Object),
      R.complement(R.isEmpty),
      R.where({
        username: R.is(String),
        email: R.is(String),
      }),
    ]),
  },
  record: {
    reason: 'Invalid record. CNAME records have to be a host name and A records has to be a list of ips',
    fn: and([
      R.is(Object),
      R.compose(R.isEmpty, R.flip(R.difference)(VALID_RECORD_TYPES), R.keys),
      R.cond([
        [R.has('CNAME'),  validateCnameRecord('CNAME')],
        [R.has('A'),      validateARecord('A')],
        [R.has('URL'),    R.propSatisfies(R.is(String), 'URL')],
        [R.T, R.T],
      ]),
    ]),
  },
});

module.exports = { getDomains, validateDomainData };
