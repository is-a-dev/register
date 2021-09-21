const fs = require("fs");
const path = require("path");
const R = require("ramda");
const { DOMAINS_PATH } = require("./constants");

const toDomain = (str) => path.join(DOMAINS_PATH, str);

const parseDomain = (str) => {
  try {
    return JSON.parse(str);
  } catch (e) {
    throw new Error("Error: Cant parse " + str);
  }
};

const toDomainData = R.compose(
  parseDomain,
  R.toString,
  fs.readFileSync,
  toDomain
);

const getDomains = () =>
  fs.promises.readdir(DOMAINS_PATH, {}).then(
    R.map((name) => ({
      ...toDomainData(name),
      name: name.replace(/\.json$/, ""),
    }))
  );

module.exports = { getDomains };
