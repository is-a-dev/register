const path = require('path');
require('dotenv').config({ path: path.resolve('.env.sandbox') });

const { NC_USER, NC_API_KEY, NC_DOMAIN } = process.env;

module.exports = {
  VALID_RECORD_TYPES: ['CNAME', 'A', 'ALIAS', 'URL'],
  NC_DOMAIN: NC_DOMAIN || 'booboo.xyz',
  NC_USER: NC_USER || 'test',
  NC_API_KEY: NC_API_KEY || 'fake_key',
  ENV: 'sandbox',
  TTL: 5*60,
  IP_ADDRESS: '100.100.100.100',
};
