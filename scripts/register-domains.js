const R = require('ramda');
const { VALID_RECORD_TYPES, TTL, ENV } = require('../utils/constants');
const { domainService: dc } = require('../utils/domain-service');
const { getDomains: gd } = require('../utils/get-domain');

// Allow TXT records while publishing (for pcl validation)
const getRecords = R.compose(R.toPairs, R.pick(VALID_RECORD_TYPES));

const address = (type, url) => {
  if ('URL' === type) return `${url}`.replace(/\/$/g, '');
  if ('TXT' === type) return url;
  return (type === 'CNAME' ? `${url}`.toLowerCase() : `${url}`).replace(/[/.]$/g, '');
};

const toHostList = R.chain(data => {
  const rs = getRecords(data.record);

  return R.chain(([recordType, urls]) =>
    (Array.isArray(urls) ? urls : [urls]).map((url, index) => ({
      name: data.name,
      type: recordType,
      address: address(recordType, url),
      ttl: TTL,
      ...(recordType === 'MX' ? { priority: index + 20 } : {})
    }))
  , rs);
});

const registerDomains = async ({ domainService, getDomains, log = () => { } }) => {
  const domains = await getDomains().then(toHostList);

  if (domains.length === 0)
    return Promise.reject(new Error('Nothing to register'));

  log(`${domains.length} records found`);
  return domainService.updateHosts(domains);
};

const main = async () => {
  console.log(`Running in ${ENV} mode`);
  const result = await registerDomains({ domainService: dc, getDomains: gd, log: console.log });
  console.log(result);
};

if (require.main === module) {
  main().catch(e => {
    console.error(e);
    process.exit(1);
  });
} else {
  module.exports = { toHostList, registerDomains };
}

