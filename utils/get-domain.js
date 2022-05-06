const fs = require('fs');
const path = require('path');
const R = require('ramda');
const {DOMAINS_PATH} = require('./constants');

const toDomain = str => path.join(DOMAINS_PATH, str);

const parseDomain = name => str => {
  try {return JSON.parse(str);}
  catch (e) {throw new Error(`Error: Cant parse ${name} => ${str}`);}
};

const toDomainData = name => R.compose(parseDomain(name), R.toString, fs.readFileSync, toDomain)(name);

const getDomains = () =>
  fs.promises.readdir(DOMAINS_PATH, {})
    .then(R.map(name => ({
      ...toDomainData(name),
      name: name.replace(/\.json$/, ''),
    })));

module.exports = {getDomains};
