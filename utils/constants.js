const path = require('path');

const { NODE_ENV: ENV = 'test' } = process.env;

const {
  DOMAIN_USER,
  DOMAIN_API_KEY,
  DOMAIN_DOMAIN,
  DOMAIN_API_HOST,
  DOMAIN_API_PORT,
  DOMAIN_HOST_IP,
} = process.env;

const IS_TEST = ENV === 'test';

const DOMAINS_PATH = path.resolve('domains');

module.exports = {
  ENV,
  IS_TEST,
  VALID_RECORD_TYPES: ['CNAME', 'A', 'URL', 'MX', 'TXT'],
  DOMAIN_DOMAIN: DOMAIN_DOMAIN || 'booboo.xyz',
  DOMAIN_USER: IS_TEST ? 'testuser' : DOMAIN_USER,
  DOMAIN_API_KEY: IS_TEST ? 'testkey' : DOMAIN_API_KEY,
  DOMAIN_API_HOST: IS_TEST ? 'example.com' : DOMAIN_API_HOST,
  DOMAIN_API_PORT: IS_TEST ? 6969 : DOMAIN_API_PORT,
  DOMAIN_HOST_IP,
  DOMAINS_PATH,
  TTL: 5 * 60 * 60,
};
