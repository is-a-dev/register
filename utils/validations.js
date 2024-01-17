const R = require('ramda');
const { VALID_RECORD_TYPES } = require('./constants');
const { or, and, validate, between, testRegex, withLengthEq, withLengthGte } = require('./helpers');
const INVALID_NAMES = require('./invalid-domains.json');
const ipRegex_ = require('ip-regex');
const ipRegex = ipRegex_.default ?? ipRegex_;

const isValidURL = and([R.is(String), testRegex(/^https?:\/\//ig)]);

const isValidDomain = and([R.is(String), testRegex(/^(([a-z0-9-]+)\.)+[a-z]+$/ig)]);

const validateCNAMERecord = type => and([
  R.propIs(String, type),
  R.compose(withLengthEq(1), R.keys), // CNAME cannot be used with any other record
  R.propSatisfies(withLengthGte(4), type),
  R.propSatisfies(isValidDomain, type),

  // Stop if the CNAME ends with netlify.com / netlify.app / vercel.app
  R.complement(R.any(testRegex(/(netlify|vercel)\.(com|app)$/i))),
]);

const validateARecord = type => and([
  R.propIs(Array, type),
  R.propSatisfies(withLengthGte(1), type),
  R.all(testRegex(ipRegex.v4({ exact: true }))),

  // Stop 76.76.21.0/24 IP block from being used (Vercel)
  R.complement(R.any(testRegex(/^76\.76\.21\./))),
]);

const validateMXRecord = type => and([
  R.propIs(Array, type),
  R.propSatisfies(withLengthGte(1), type),
  R.propSatisfies(R.all(isValidDomain), type),
]);

const validateTXTRecord = type => and([
  R.propSatisfies(or([ R.is(String), R.is(Array) ]), type),
  R.propSatisfies(R.all(R.is(String)), type),

  // Stop if the TXT record starts with vc-domain-verify
  R.complement(R.any(testRegex(/^vc-domain-verify/))),
]);

const validateAAAARecord = R.propSatisfies(and([
  R.is(Array),
  withLengthGte(1),
  R.all(testRegex(ipRegex.v6({ exact: true }))),
]))

const checkRestrictedNames = R.complement(R.includes(R.__, INVALID_NAMES))

const extraSupportedNames = [
  testRegex(/^_github(-pages)?-challenge-[a-z0-9-_]+$/i), // Exception for github verification records
  R.equals('_discord'),
  R.equals('_gitlab-pages-verification-code'),
]

const validateDomainData = validate({
  name: {
    reason: 'The name of the file is invalid. It must be lowercased, alphanumeric and each component must be more than 2 characters long',
    fn: or([
      R.equals('@'),
      and([
        R.is(String),
        checkRestrictedNames,
        R.compose(
          R.all(or([
            and([
              R.compose(between(2, 100), R.length),
              testRegex(/^[a-z0-9-]+$/g),
              checkRestrictedNames,
            ]),
            ...extraSupportedNames,
          ])),
          R.split('.'),
        ),
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
    reason: 'Invalid record. CNAME records have to be a host name. A records have to be a list of IPs. TXT records have to be a string or an array of strings. MX records have to be a list of host names. URL records have to be a valid URL. AAAA records have to be a list of IPv6 addresses.',
    fn: and([
      R.is(Object),
      R.compose(R.isEmpty, R.difference(R.__, VALID_RECORD_TYPES), R.keys),
      R.cond([
        [R.has('CNAME'), validateCNAMERecord('CNAME')],
        [R.has('A'), validateARecord('A')],
        [R.has('URL'), R.propSatisfies(isValidURL, 'URL')],
        [R.has('MX'), validateMXRecord('MX')],
        [R.has('TXT'), validateTXTRecord('TXT')],
        [R.has('AAAA'), validateAAAARecord('AAAA')],
        [R.T, R.T],
      ]),
    ]),
  },
});

module.exports = { validateDomainData, isValidDomain };
