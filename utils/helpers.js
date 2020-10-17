const R = require('ramda');
const { IS_TEST } = require('./constants');

const log = IS_TEST ? () => {} : console.log;
const print = fn => x => log(fn(x)) || x;

const between = (min, max) => num => num >= min && num <= max;
const testRegex = regex => str => !!(str && str.match(regex));

const validate = pattern => data => R.compose(
  invalidPairs => invalidPairs.length
    ? { errors: invalidPairs, valid: false }
    : { errors: [], valid: true },
  R.filter(([key, { fn }]) => fn ? !fn(data[key]) : false),
  R.toPairs,
)(pattern);

const or = R.anyPass;
const and = R.allPass;

const then = fn => p => p.then(fn);

const lazyTask = fn => data => () => fn(data);

const batchLazyTasks = count => tasks => tasks.reduce((batches, task) => {
  if (batches.length === 0) return [[task]];

  const full = R.init(batches);
  const last = R.last(batches);

  if (last.length >= count) return [...batches, [task]];
  return [...full, [...last, task]];
}, []);

const withLengthGte = n => R.compose(R.gte(R.__, n), R.length);
const withLengthEq = n => R.compose(R.equals(n), R.length);

module.exports = {
  or,
  and,
  validate,
  between,
  testRegex,
  log,
  print,
  then,
  lazyTask,
  batchLazyTasks,
  withLengthEq,
  withLengthGte,
};

