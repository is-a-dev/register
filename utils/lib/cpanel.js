const R = require('ramda');
const fetch = require('node-fetch');
const qs = require('qs');
const { DOMAIN_API_HOST, DOMAIN_API_PORT, DOMAIN_USER, DOMAIN_API_KEY, DOMAIN_DOMAIN, ...c } = require('../constants');

const CpanelClient = (options) => {
  // TODO: Make defaultQuery functional
  const api = (module, func, defaultQuery = {}) => (q = {}) => {
    const query = {
      ...defaultQuery,
      ...q,
      cpanel_jsonapi_user: options.username,
      cpanel_jsonapi_module: module,
      cpanel_jsonapi_func: func,
      cpanel_jsonapi_apiversion: 2,
    };

    const request = {
      headers: {
        Authorization: `cpanel ${options.username}:${options.apiKey}`,
      },
      rejectUnauthorized: false,
    };

    const path = `${options.path || '/json-api'}/cpanel?${qs.stringify(query)}`;
    const reqUrl = `https://${options.host}:${options.port}/${path}`;

    const { fetch } = options.dependencies;
    return fetch(reqUrl, request).then(res => res.json());
  };

  return {
    // { customonly, domain }
    //     -> { cpanelresult: { data[{ class, ttl, name, line, Line, cname, type, record }] } }
    fetchZoneRecords: R.compose(
      p => p.then(R.pathOr([], ['cpanelresult', 'data'])),
      api('ZoneEdit', 'fetchzone_records', { customonly: 1, domain: options.domain })
    ),
    // { domain, name, type, cname, address, ttl }
    //     -> { result: { status } }
    addZoneRecord: api('ZoneEdit', 'add_zone_record', { domain: options.domain }),
  };
};

if (!DOMAIN_API_KEY) {
  console.error('Api key cannot be empty');
  process.exit(1);
}

const cpanel = CpanelClient({
  host: DOMAIN_API_HOST,
  port: DOMAIN_API_PORT,
  username: DOMAIN_USER,
  apiKey: DOMAIN_API_KEY,
  domain: DOMAIN_DOMAIN,
  dependencies: { fetch },
});

// cpanel.fetchZoneRecords().then(hosts => console.log(JSON.stringify(hosts, null, 2)));

module.exports = {
  cpanel,
  CpanelClient,
};

