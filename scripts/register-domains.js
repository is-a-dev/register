const R = require('ramda');
const { VALID_RECORD_TYPES, DOMAIN_HOST_IP, TTL, ENV } = require('../utils/constants');
const { domainService: dc } = require('../utils/domain-service');
const { getDomains: gd } = require('../utils/get-domain');

const getRecords = R.compose(R.toPairs, R.pick(VALID_RECORD_TYPES));

const address = (type, value) => {
  if ('URL' === type) return `${value}`.replace(/\/$/g, '');
  if ('TXT' === type) return value;
  return (type === 'CNAME' ? `${value}`.toLowerCase() : `${value}`).replace(/[/.]$/g, '');
};

const toHostList = R.chain(data => {
  // URL redirection must contain explicit A record
  // Wildcard A record breaks when used with MX
  // Ref: https://github.com/is-a-dev/register/issues/2365
  if (data.record.URL && data.record.MX) {
    data.record.A = [ DOMAIN_HOST_IP ]
  }

  const records = getRecords(data.record);

  return R.chain(([recordType, values]) => {
    const valueList = Array.isArray(values) ? values : [values];

    return valueList.map((value, index) => ({
      name: data.name,
      type: recordType,
      address: address(recordType, value),
      ttl: TTL,
      ...(recordType === 'MX' ? { priority: index + 20 } : {})
    }))
  }, records)
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

