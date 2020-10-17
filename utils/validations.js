const R = require('ramda');
const { VALID_RECORD_TYPES } = require('./constants');
const { or, and, validate, between, testRegex } = require('./helpers');

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

module.exports = { validateDomainData };
