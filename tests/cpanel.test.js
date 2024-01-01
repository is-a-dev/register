const R = require('ramda');
const { CpanelClient } = require('../utils/lib/cpanel');

const mockFetch = (expectRequest, decorate = R.identity) => (reqUrl, request) => {
  expectRequest(reqUrl, request);
  return Promise.resolve({
    json: async () => decorate(request),
  });
};

describe('Cpanel client', () => {
  describe('fetchzonerecords', () => {
    it('should make the correct request', async () => {
      const fetch = mockFetch((url, request) => {
        expect(url).toBe('https://example.com:2000/json-api/cpanel?customonly=1&domain=a.b&cpanel_jsonapi_user=boy&cpanel_jsonapi_module=ZoneEdit&cpanel_jsonapi_func=fetchzone_records&cpanel_jsonapi_apiversion=2');
        expect(request).toEqual({
          headers: {
            Authorization: 'cpanel boy:boybyebye',
          },
          rejectUnauthorized: false,
        });
      });

      const cpanel = CpanelClient({
        host: 'example.com',
        port: 2000,
        username: 'boy',
        apiKey: 'boybyebye',
        domain: 'a.b',
        dependencies: { fetch },
      });

      await cpanel.zone.fetch();
    });

    it('should make the correct request with query', async () => {
      const fetch = mockFetch((url, request) => {
        expect(url).toBe('https://example.com:2000/json-api/cpanel?customonly=1&domain=foobar.boeey&cpanel_jsonapi_user=boy&cpanel_jsonapi_module=ZoneEdit&cpanel_jsonapi_func=fetchzone_records&cpanel_jsonapi_apiversion=2');
        expect(request).toEqual({
          headers: {
            Authorization: 'cpanel boy:boybyebye',
          },
          rejectUnauthorized: false,
        });
      });

      const cpanel = CpanelClient({
        host: 'example.com',
        port: 2000,
        username: 'boy',
        apiKey: 'boybyebye',
        domain: 'a.b',
        dependencies: { fetch },
      });

      await cpanel.zone.fetch({ domain: 'foobar.boeey' });
    });
  });

  describe('addzonerecord', () => {
    it('should make the correct request', async () => {
      const fetch = mockFetch((url, request) => {
        expect(url).toBe('https://example.com:2000/json-api/cpanel?domain=a.b&name=googo&type=CNAME&cname=beey&ttl=2020&cpanel_jsonapi_user=boy&cpanel_jsonapi_module=ZoneEdit&cpanel_jsonapi_func=add_zone_record&cpanel_jsonapi_apiversion=2');
        expect(request).toEqual({
          headers: {
            Authorization: 'cpanel boy:boybyebye',
          },
          rejectUnauthorized: false,
        });
      });

      const cpanel = CpanelClient({
        host: 'example.com',
        port: 2000,
        username: 'boy',
        apiKey: 'boybyebye',
        domain: 'a.b',
        dependencies: { fetch },
      });

      await cpanel.zone.add({
        name: 'googo',
        type: 'boyee',
        cname: 'beey',
        type: 'CNAME',
        ttl: 2020,
      });
    });
  });

  describe('addzonerecord', () => {
    it('should make the correct request', async () => {
      const fetch = mockFetch((url, request) => {
        expect(url).toBe('https://example.com:2000/json-api/cpanel?domain=a.b&line=500&cpanel_jsonapi_user=boy&cpanel_jsonapi_module=ZoneEdit&cpanel_jsonapi_func=remove_zone_record&cpanel_jsonapi_apiversion=2');
        expect(request).toEqual({
          headers: {
            Authorization: 'cpanel boy:boybyebye',
          },
          rejectUnauthorized: false,
        });
      });

      const cpanel = CpanelClient({
        host: 'example.com',
        port: 2000,
        username: 'boy',
        apiKey: 'boybyebye',
        domain: 'a.b',
        dependencies: { fetch },
      });

      await cpanel.zone.remove({
        line: 500,
      });
    });
  });

  describe('fetchredirections', () => {
    it('should make the correct request', async () => {
      const fetch = mockFetch((url, request) => {
        expect(url).toBe('https://example.com:2000/execute/Mime/list_redirects?cpanel_jsonapi_user=boy&cpanel_jsonapi_module=Mime&cpanel_jsonapi_func=list_redirects&cpanel_jsonapi_apiversion=2');
        expect(request).toEqual({
          headers: {
            Authorization: 'cpanel boy:boybyebye',
          },
          rejectUnauthorized: false,
        });
      });

      const cpanel = CpanelClient({
        host: 'example.com',
        port: 2000,
        username: 'boy',
        apiKey: 'boybyebye',
        domain: 'a.b',
        dependencies: { fetch },
      });

      await cpanel.redirection.fetch();
    });
  });
  describe('addredirection', () => {
    it('should make the correct request', async () => {
      const fetch = mockFetch((url, request) => {
        expect(url).toBe('https://example.com:2000/execute/Mime/add_redirect?domain=googo&destination=https%3A%2F%2Foodf.com&cpanel_jsonapi_user=boy&cpanel_jsonapi_module=Mime&cpanel_jsonapi_func=add_redirect&cpanel_jsonapi_apiversion=2');
        expect(request).toEqual({
          headers: {
            Authorization: 'cpanel boy:boybyebye',
          },
          rejectUnauthorized: false,
        });
      });

      const cpanel = CpanelClient({
        host: 'example.com',
        port: 2000,
        username: 'boy',
        apiKey: 'boybyebye',
        domain: 'a.b',
        dependencies: { fetch },
      });

      await cpanel.redirection.add({
        domain: 'googo',
        destination: 'https://oodf.com'
      });
    });
  });

  describe('deleteredirection', () => {
    it('should make the correct request', async () => {
      const fetch = mockFetch((url, request) => {
        expect(url).toBe('https://example.com:2000/execute/Mime/delete_redirect?domain=googo&cpanel_jsonapi_user=boy&cpanel_jsonapi_module=Mime&cpanel_jsonapi_func=delete_redirect&cpanel_jsonapi_apiversion=2');
        expect(request).toEqual({
          headers: {
            Authorization: 'cpanel boy:boybyebye',
          },
          rejectUnauthorized: false,
        });
      });

      const cpanel = CpanelClient({
        host: 'example.com',
        port: 2000,
        username: 'boy',
        apiKey: 'boybyebye',
        domain: 'a.b',
        dependencies: { fetch },
      });

      await cpanel.redirection.remove({ domain: 'googo' });
    });
  });
});

