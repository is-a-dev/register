const fs = require('fs');
const path = require('path');
const R = require('ramda');
const { DOMAINS_PATH } = require('./constants');

const toDomain = str => path.join(DOMAINS_PATH, str);

const toDomainData = R.compose(JSON.parse, R.toString, fs.readFileSync, toDomain);

const getDomains = () =>
  fs.promises.readdir(DOMAINS_PATH, {})
    .then(R.map(name => ({
      ...toDomainData(name),
      name: name.replace(/\.json$/, ''),
    })));

module.exports = { getDomains };
