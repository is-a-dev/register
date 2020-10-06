const path = require('path');

if (!process.env.CI) {
  const { ENV = 'sandbox' } = process.env;
  require('dotenv').config({ path: path.resolve(`.env.${ENV}`) });
}

const { NC_USER, NC_API_KEY, NC_DOMAIN, IP_ADDRESS } = process.env;

module.exports = {
  ENV,
  VALID_RECORD_TYPES: ['CNAME', 'A', 'ALIAS', 'URL'],
  NC_DOMAIN: NC_DOMAIN || 'booboo.xyz',
  NC_USER,
  NC_API_KEY,
  IP_ADDRESS,
  TTL: 5*60,
};
