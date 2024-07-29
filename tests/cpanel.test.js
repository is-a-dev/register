const R = require("ramda");
const { CpanelClient } = require("../utils/lib/cpanel");

const mockFetch =
    (expectRequest, decorate = R.identity) =>
    (reqUrl, request) => {
        expectRequest(reqUrl, request);
        return Promise.resolve({
            json: async () => decorate(request),
        });
    };

describe("Cpanel client", () => {
    describe("fetchzonerecords", () => {
        it("should make the correct request", async () => {
            const fetch = mockFetch((url, request) => {
                expect(url).toBe(
                    "https://example.com:3000/json-api/cpanel?customonly=0&domain=example.org&cpanel_jsonapi_user=username&cpanel_jsonapi_module=ZoneEdit&cpanel_jsonapi_func=fetchzone_records&cpanel_jsonapi_apiversion=2",
                );
                expect(request).toEqual({
                    headers: {
                        Authorization: "cpanel username:apikey",
                    },
                    rejectUnauthorized: false,
                });
            });

            const cpanel = CpanelClient({
                host: "example.com",
                port: 3000,
                username: "username",
                apiKey: "apikey",
                domain: "example.org",
                dependencies: { fetch },
            });

            await cpanel.zone.fetch();
        });

        it("should make the correct request with query", async () => {
            const fetch = mockFetch((url, request) => {
                expect(url).toBe(
                    "https://example.com:3000/json-api/cpanel?customonly=0&domain=example.zone&cpanel_jsonapi_user=username&cpanel_jsonapi_module=ZoneEdit&cpanel_jsonapi_func=fetchzone_records&cpanel_jsonapi_apiversion=2",
                );
                expect(request).toEqual({
                    headers: {
                        Authorization: "cpanel username:apikey",
                    },
                    rejectUnauthorized: false,
                });
            });

            const cpanel = CpanelClient({
                host: "example.com",
                port: 3000,
                username: "username",
                apiKey: "apikey",
                domain: "example.org",
                dependencies: { fetch },
            });

            await cpanel.zone.fetch({ domain: "example.zone" });
        });
    });

    describe("addzonerecord", () => {
        it("should make the correct request", async () => {
            const fetch = mockFetch((url, request) => {
                expect(url).toBe(
                    "https://example.com:3000/json-api/cpanel?domain=example.org&name=example.zone&type=CNAME&cname=beey&ttl=2020&cpanel_jsonapi_user=username&cpanel_jsonapi_module=ZoneEdit&cpanel_jsonapi_func=add_zone_record&cpanel_jsonapi_apiversion=2",
                );
                expect(request).toEqual({
                    headers: {
                        Authorization: "cpanel username:apikey",
                    },
                    rejectUnauthorized: false,
                });
            });

            const cpanel = CpanelClient({
                host: "example.com",
                port: 3000,
                username: "username",
                apiKey: "apikey",
                domain: "example.org",
                dependencies: { fetch },
            });

            await cpanel.zone.add({
                name: "example.zone",
                type: "username",
                cname: "example.com",
                type: "CNAME",
                ttl: 2020,
            });
        });
    });

    describe("addzonerecord", () => {
        it("should make the correct request", async () => {
            const fetch = mockFetch((url, request) => {
                expect(url).toBe(
                    "https://example.com:3000/json-api/cpanel?domain=example.org&line=500&cpanel_jsonapi_user=username&cpanel_jsonapi_module=ZoneEdit&cpanel_jsonapi_func=remove_zone_record&cpanel_jsonapi_apiversion=2",
                );
                expect(request).toEqual({
                    headers: {
                        Authorization: "cpanel username:apikey",
                    },
                    rejectUnauthorized: false,
                });
            });

            const cpanel = CpanelClient({
                host: "example.com",
                port: 3000,
                username: "username",
                apiKey: "apikey",
                domain: "example.org",
                dependencies: { fetch },
            });

            await cpanel.zone.remove({
                line: 500,
            });
        });
    });

    describe("fetchredirections", () => {
        it("should make the correct request", async () => {
            const fetch = mockFetch((url, request) => {
                expect(url).toBe(
                    "https://example.com:3000/execute/Mime/list_redirects?cpanel_jsonapi_user=username&cpanel_jsonapi_module=Mime&cpanel_jsonapi_func=list_redirects&cpanel_jsonapi_apiversion=2",
                );
                expect(request).toEqual({
                    headers: {
                        Authorization: "cpanel username:apikey",
                    },
                    rejectUnauthorized: false,
                });
            });

            const cpanel = CpanelClient({
                host: "example.com",
                port: 3000,
                username: "username",
                apiKey: "apikey",
                domain: "example.org",
                dependencies: { fetch },
            });

            await cpanel.redirection.fetch();
        });
    });
    describe("addredirection", () => {
        it("should make the correct request", async () => {
            const fetch = mockFetch((url, request) => {
                expect(url).toBe(
                    "https://example.com:3000/execute/Mime/add_redirect?domain=example.zone&destination=https%3A%2F%2Fexample.com&cpanel_jsonapi_user=username&cpanel_jsonapi_module=Mime&cpanel_jsonapi_func=add_redirect&cpanel_jsonapi_apiversion=2",
                );
                expect(request).toEqual({
                    headers: {
                        Authorization: "cpanel username:apikey",
                    },
                    rejectUnauthorized: false,
                });
            });

            const cpanel = CpanelClient({
                host: "example.com",
                port: 3000,
                username: "username",
                apiKey: "apikey",
                domain: "example.org",
                dependencies: { fetch },
            });

            await cpanel.redirection.add({
                domain: "example.zone",
                destination: "https://example.com",
            });
        });
    });

    describe("deleteredirection", () => {
        it("should make the correct request", async () => {
            const fetch = mockFetch((url, request) => {
                expect(url).toBe(
                    "https://example.com:3000/execute/Mime/delete_redirect?domain=example.zone&cpanel_jsonapi_user=username&cpanel_jsonapi_module=Mime&cpanel_jsonapi_func=delete_redirect&cpanel_jsonapi_apiversion=2",
                );
                expect(request).toEqual({
                    headers: {
                        Authorization: "cpanel username:apikey",
                    },
                    rejectUnauthorized: false,
                });
            });

            const cpanel = CpanelClient({
                host: "example.com",
                port: 3000,
                username: "username",
                apiKey: "apikey",
                domain: "example.org",
                dependencies: { fetch },
            });

            await cpanel.redirection.remove({ domain: "example.zone" });
        });
    });
});
