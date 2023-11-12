const R = require('ramda');
const qs = require('querystring');
const { DOMAIN_API_HOST, DOMAIN_API_PORT, DOMAIN_USER, DOMAIN_API_KEY, DOMAIN_DOMAIN } = require('../constants');

const CpanelClient = (options) => {
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
      //     -> [{ class, ttl, name, line, Line, cname, type, record }]
      fetch: R.compose(
        p => p.then(R.pathOr([], ['cpanelresult', 'data'])),
        api2('ZoneEdit', 'fetchzone_records', { customonly: 1, domain: options.domain })
      ),

      // { name, type(A|CNAME), cname, address, ttl }
      //     -> {}
      add: api2('ZoneEdit', 'add_zone_record', { domain: options.domain }),

      // { line }
      //     -> {}
      remove: api2('ZoneEdit', 'remove_zone_record', { domain: options.domain }),
    },
    redirection: {
      // {}
      //     -> [{ domain, destination }]
      fetch: R.compose(
        p => p.then(R.pathOr([], ['data'])),
        uapi('Mime', 'list_redirects'),
      ),

      // { domain, redirect, type(permanent|tmp), redirect_wildcard(0|1), redirect(0|1|2) }
      //     -> {}
      add: uapi('Mime', 'add_redirect'),

      // { domain }
      //     -> {}
      remove: uapi('Mime', 'delete_redirect'),
    },
    file: {
      write: uapi('Fileman', 'save_file_content', { from_charset: 'UTF-8', to_charset: 'UTF-8', fallback: 1 }),
    },
    email: {
      // { domain, exchanger, priority }
      //     -> {}
      add: uapi('Email', 'add_mx', { alwaysaccept: 'auto' }),

      // { domain, exchanger, priority }
      //     -> {}
      remove: uapi('Email', 'delete_mx', { alwaysaccept: 'auto' }),
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

module.exports = {
  cpanel,
  CpanelClient,
};

