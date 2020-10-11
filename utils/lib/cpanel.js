const R = require('ramda');
const fetch = require('node-fetch');
const qs = require('qs');
const { DOMAIN_API_HOST, DOMAIN_API_PORT, DOMAIN_USER, DOMAIN_API_KEY, DOMAIN_DOMAIN, ...c } = require('../constants');

const CpanelClient = (options) => {
  // TODO: Make defaultQuery functional
  const api = ({ basePath = '', action = '' }) => (module, func, defaultQuery = {}) => (q = {}) => {
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

    const path = `${basePath}/${action}?${qs.stringify(query)}`;
    const reqUrl = `https://${options.host}:${options.port}/${path}`;

    const { fetch } = options.dependencies;
    return fetch(reqUrl, request).then(res => res.json());
  };

  const api2 = api({ basePath: 'json-api', action: 'cpanel' });
  const uapi = (module, func, defaultQuery) =>
    api({ basePath: 'execute', action: `${module}/${func}` })(module, func, defaultQuery);

  return {
    zone: {
      // { customonly, domain }
      //     -> { cpanelresult: { data[{ class, ttl, name, line, Line, cname, type, record }] } }
      fetch: R.compose(
        p => p.then(R.pathOr([], ['cpanelresult', 'data'])),
        api2('ZoneEdit', 'fetchzone_records', { customonly: 1, domain: options.domain })
      ),

      // { name, type(A|CNAME), cname, address, ttl }
      //     -> {}
      add: api2('ZoneEdit', 'add_zone_record', { domain: options.domain }),

      // { name, type(A|CNAME), cname, address, ttl }
      //     -> {}
      edit: api2('ZoneEdit', 'edit_zone_record', { domain: options.domain }),
    },
    redirection: {
      // {}
      //     -> { domain, destination }
      fetch: R.compose(
        p => p.then(R.pathOr([], ['data'])),
        uapi('Mime', 'list_redirects'),
      ),

      // { domain, redirect, type(permanent|tmp), redirect_wildcard(0|1), redirect(0|1|2) }
      //     -> {}
      add: uapi('Mime', 'add_redirect'),
      edit: uapi('Mime', 'add_redirect'), // NOTE: adding new updates exisiting
    },
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

//cpanel.fetchZoneRecords()
//cpanel.addRedirection({
  //domain: 'hello.is-a.dev',
  //redirect: 'https://googole.com',
  //type: 'permanent',
  //redirect_wildcard: 1,
  //redirect_www: 0,
//})
//cpanel.fetchRedirections()
  //.then(d => console.log(JSON.stringify(d, null, 2)))
  //.catch(console.error);

module.exports = {
  cpanel,
  CpanelClient,
};

