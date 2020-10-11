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
        expect(url).toBe('https://example.com:2000//json-api/cpanel?customonly=1&domain=is-a.dev&cpanel_jsonapi_user=boy&cpanel_jsonapi_module=ZoneEdit&cpanel_jsonapi_func=fetchzone_records&cpanel_jsonapi_apiversion=2');
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
        dependencies: { fetch },
      });

      await cpanel.fetchZoneRecords();
    });

    it('should make the correct request with query', async () => {
      const fetch = mockFetch((url, request) => {
        expect(url).toBe('https://example.com:2000//json-api/cpanel?customonly=1&domain=foobar.boeey&cpanel_jsonapi_user=boy&cpanel_jsonapi_module=ZoneEdit&cpanel_jsonapi_func=fetchzone_records&cpanel_jsonapi_apiversion=2');
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
        dependencies: { fetch },
      });

      await cpanel.fetchZoneRecords({ domain: 'foobar.boeey' });
    });
  });

  describe('addzonerecord', () => {
    it('should make the correct request', async () => {
      const fetch = mockFetch((url, request) => {
        expect(url).toBe('https://example.com:2000//json-api/cpanel?domain=is-a.dev&name=googo&type=CNAME&cname=beey&ttl=2020&cpanel_jsonapi_user=boy&cpanel_jsonapi_module=ZoneEdit&cpanel_jsonapi_func=add_zone_record&cpanel_jsonapi_apiversion=2');
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
        dependencies: { fetch },
      });

      await cpanel.addZoneRecord({
        name: 'googo',
        type: 'boyee',
        cname: 'beey',
        type: 'CNAME',
        ttl: 2020,
      });
    });
  });
});

