const R = require('ramda');
const { VALID_RECORD_TYPES } = require('./constants');
const { or, and, validate, between, testRegex, withLengthEq, withLengthGte } = require('./helpers');
const INVALID_NAMES = require('./invalid-domains.json');

const isValidURL = testRegex(/^https?:\/\//ig);

const isValidDomain = testRegex(/^(([a-z0-9\-]+)\.)+[a-z]+$/ig)

// TODO: Add priority to records

const allowMXRecord = R.compose(
  R.ifElse(R.includes('MX'), withLengthEq(2), withLengthEq(1)),
  R.keys,
);

const validateCnameRecord = key => and([
  R.propSatisfies(R.is(String), key),
  allowMXRecord,
  R.propSatisfies(withLengthGte(4), key),
  R.propSatisfies(isValidDomain, key),
  //R.propSatisfies(R.complement(isValidURL), key),
]);

const validateARecord = key => and([
  allowMXRecord,
  R.propSatisfies(withLengthGte(1), key),
  R.propIs(Array, key),
]);

const validateMXRecord = key => and([
  R.propSatisfies(withLengthGte(1), key),
  R.propSatisfies(R.all(isValidDomain), key),
  R.propIs(Array, key),
]);

const validateDomainData = validate({
  name: {
    reason: 'The name of the file is invalid. It must be lowercased, alphanumeric and more than 2 characters long',
    fn: or([
      R.equals('@'),
      and([
        R.compose(between(2, 100), R.length),
        testRegex(/^[a-z0-9-]+$/g),
        R.complement(R.includes(R.__, INVALID_NAMES)),
      ])
    ]),
  },
  description: { reason: '', fn: R.T, },
  repo: { reason: '', fn: R.T, },
  owner: {
    reason: '`owner` needs valid username and email properties',
    fn: and([
      R.is(Object),
      R.complement(R.isEmpty),
      R.where({
        username: and([R.is(String), withLengthGte(1)]),
        email: R.is(String),
      }),
    ]),
  },
  record: {
    reason: 'Invalid record. CNAME records have to be a host name and A records has to be a list of ips',
    fn: and([
      R.is(Object),
      R.compose(R.isEmpty, R.difference(R.__, VALID_RECORD_TYPES), R.keys),
      R.cond([
        [R.has('CNAME'), validateCnameRecord('CNAME')],
        [R.has('A'), validateARecord('A')],
        [R.has('URL'), R.propSatisfies(isValidURL, 'URL')],
        [R.has('MX'), validateMXRecord('MX')],
        [R.T, R.T],
      ]),
    ]),
  },
});

module.exports = { validateDomainData, isValidDomain };
