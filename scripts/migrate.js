const fs = require('fs');
const path = require('path');
const R = require('ramda');
const { DOMAINS_PATH } = require('../utils/constants');

const migrate = ([file, domain]) => [
  file,
  {
    ...domain,
    record: file !== '@.json' && /\.is-a\.dev$/.test(domain.record.URL || '')
      ? R.dissoc('URL', domain.record)
      : domain.record,
  }
];

const main = async () => {
  const domains = await fs.promises.readdir(DOMAINS_PATH).then(R.map(async file => [
    file,
    JSON.parse(await fs.promises.readFile(path.join(DOMAINS_PATH, file), 'utf-8')),
  ])).then(ps => Promise.all(ps));

  const newDomains = domains.map(migrate);

  await Promise.all(newDomains.map(([file, json]) => {
    return fs.promises.writeFile(path.join(DOMAINS_PATH, file), JSON.stringify(json, null, 2));
  }));
};

main();

