const R = require('ramda');

const log = m => x => console.log(m, x) || x;

const between = (min, max) => num => num >= min && num <= max;
const testRegex = regex => str => !!(str && str.match(regex));

const validate = pattern => data => R.compose(
  invalidPairs => invalidPairs.length ? { errors: invalidPairs, valid: false } : { errors: [], valid: true },
  R.filter(([key, { fn }]) => fn ? !fn(data[key]) : false),
  R.toPairs,
)(pattern);

const or = R.anyPass;
const and = R.allPass;

const then = fn => p => p.then(fn);

module.exports = { or, and, validate, between, testRegex, log, then };

