const R = require('ramda');
const { VALID_RECORD_TYPES, TTL } = require('../utils/constants');
const { domainService: domain } = require('../utils/domain-service');
const { getDomains } = require('../utils/domain');

const getRecords = R.compose(R.toPairs, R.pick(VALID_RECORD_TYPES));

const toHostList = R.chain(data => {
  const rs = getRecords(data.record);

  return R.chain(([recordType, urls]) =>
    (Array.isArray(urls) ? urls : [urls]).map(url => ({
      HostName: data.name,
      RecordType: recordType,
      Address: url,
      TTL,
    }))
  , rs);
});

const registerDomains = async ({ domainService, getDomains }) => {
  const domains = await getDomains().then(toHostList);
};

const main = () => {
  console.log('Running cli');
};

if (require.main === module) {
  main();
} else {
  module.exports = { toHostList, registerDomains };
}

