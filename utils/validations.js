const R = require('ramda');
const { VALID_RECORD_TYPES } = require('./constants');
const { or, and, validate, between, testRegex } = require('./helpers');
const withLengthGte = n => R.compose(R.gte(R.__, n), R.length);
const withLengthEq = n => R.compose(R.equals(n), R.length);

const validateCnameRecord = key => and([
  R.propSatisfies(R.is(String), key),
  R.compose(withLengthEq(1), R.reject(R.equals('URL')), R.keys),
  R.propSatisfies(withLengthGte(3), key),
  R.propSatisfies(R.complement(testRegex(/^https?:\/\//ig)), key),
]);

const validateARecord = key => and([
  R.compose(withLengthEq(1), R.keys),
  R.propSatisfies(withLengthGte(1), key),
]);

const validateDomainData = validate({
  name: {
    reason: 'The name of the file is invalid',
    fn: or([
      R.equals('@'),
      and([
        R.compose(between(2, 100), R.length),
        testRegex(/^[a-z0-9-]+$/g),
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
        username: and([ R.is(String), withLengthGte(1) ]),
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

module.exports = { validateDomainData };
