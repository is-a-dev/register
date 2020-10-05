const path = require('path');
const { ENV = 'sandbox' } = process.env;
require('dotenv').config({ path: path.resolve(`.env.${ENV}`) });

const { NC_USER, NC_API_KEY, NC_DOMAIN, IP_ADDRESS } = process.env;

module.exports = {
  VALID_RECORD_TYPES: ['CNAME', 'A', 'ALIAS', 'URL'],
  NC_DOMAIN: NC_DOMAIN || 'booboo.xyz',
  NC_USER: NC_USER || 'test',
  NC_API_KEY: NC_API_KEY || 'fake_key',
  ENV,
  TTL: 5*60,
  IP_ADDRESS,
};
