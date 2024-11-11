const t = require("ava");
const fs = require("fs-extra");
const path = require("path");

const { expandIPv6, isPublicIPv4, isPublicIPv6 } = require("../utils/functions");

const validRecordTypes = ["A", "AAAA", "CAA", "CNAME", "DS", "MX", "NS", "SRV", "TXT", "URL"];

const hostnameRegex = /^(?=.{1,253}$)(?:(?:[_a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)\.)+[a-zA-Z]{2,63}$/;
const ipv4Regex = /^(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}$/;
const ipv6Regex =
    /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::(?:[0-9a-fA-F]{1,4}:){0,6}[0-9a-fA-F]{1,4}$|^(?:[0-9a-fA-F]{1,4}:){1,7}:$|^(?:[0-9a-fA-F]{1,4}:){0,6}::(?:[0-9a-fA-F]{1,4}:){0,5}[0-9a-fA-F]{1,4}$/;

const domainsPath = path.resolve("domains");
const files = fs.readdirSync(domainsPath);

t("All files should have valid record types", (t) => {
    files.forEach((file) => {
        const data = fs.readJsonSync(path.join(domainsPath, file));
        const recordKeys = Object.keys(data.record);

        recordKeys.forEach((key) => {
            t.true(validRecordTypes.includes(key), `${file}: Invalid record type: ${key}`);
        });

        // CNAME records cannot be combined with any other record type
        if (recordKeys.includes("CNAME")) {
            t.is(recordKeys.length, Number(1), `${file}: CNAME records cannot be combined with other records`);
        }

        // NS records cannot be combined with any other record type, except for DS records
        if (recordKeys.includes("NS")) {
            t.true(
                recordKeys.length === 1 || (recordKeys.length === 2 && recordKeys.includes("DS")),
                `${file}: NS records cannot be combined with other records, except for DS records`
            );
        }

        // DS records must be combined with NS records
        if (recordKeys.includes("DS")) {
            t.true(recordKeys.includes("NS"), `${file}: DS records must be combined with NS records`);
        }
    });
});

t("All files should not have duplicate record keys", (t) => {
    files.forEach((file) => {
        const data = fs.readJsonSync(path.join(domainsPath, file));

        const recordKeys = Object.keys(data.record);
        const uniqueRecordKeys = new Set(recordKeys);

        t.is(recordKeys.length, uniqueRecordKeys.size, `${file}: Duplicate record keys found`);
    });
});

t("All files should have valid record values", (t) => {
    files.forEach((file) => {
        const data = fs.readJsonSync(path.join(domainsPath, file));

        Object.keys(data.record).forEach((key) => {
            const value = data.record[key];

            // *: string[]
            if (["A", "AAAA", "MX", "NS"].includes(key)) {
                t.true(Array.isArray(value), `${file}: Record value should be an array for ${key}`);

                value.forEach((record) => {
                    t.true(typeof record === "string", `${file}: Record value should be a string for ${key}`);
                });

                // A: string[]
                if (key === "A") {
                    value.forEach((record) => {
                        t.regex(
                            record,
                            ipv4Regex,
                            `${file}: Record value should be a valid IPv4 address for ${key} at index ${value.indexOf(
                                record
                            )}`
                        );

                        t.true(
                            isPublicIPv4(record, data.proxied),
                            `${file}: Record value should be a public IPv4 address for ${key} at index ${value.indexOf(
                                record
                            )}`
                        );
                    });
                }

                // AAAA: string[]
                if (key === "AAAA") {
                    value.forEach((record) => {
                        t.regex(
                            expandIPv6(record),
                            ipv6Regex,
                            `${file}: Record value should be a valid IPv6 address for ${key} at index ${value.indexOf(
                                record
                            )}`
                        );

                        t.true(
                            isPublicIPv6(record),
                            `${file}: Record value should be a public IPv6 address for ${key} at index ${value.indexOf(
                                record
                            )}`
                        );
                    });
                }

                // *: string[]
                if (["MX", "NS"].includes(key)) {
                    value.forEach((record) => {
                        t.regex(
                            record,
                            hostnameRegex,
                            `${file}: Record value should be a valid hostname for ${key} at index ${value.indexOf(
                                record
                            )}`
                        );
                    });
                }
            }

            // *: string
            if (["CNAME", "URL"].includes(key)) {
                t.true(typeof value === "string", `${file}: Record value should be a string for ${key}`);

                if (key === "CNAME") {
                    t.regex(value, hostnameRegex, `${file}: Record value should be a valid hostname for ${key}`);
                }

                if (key === "URL") {
                    t.notThrows(() => new URL(value), `${file}: Record value should be a valid URL for ${key}`);
                }
            }

            // *: {}[]
            if (["CAA", "DS", "SRV"].includes(key)) {
                t.true(Array.isArray(value), `${file}: Record value should be an array for ${key}`);

                value.forEach((record) => {
                    t.true(
                        typeof record === "object",
                        `${file}: Record value should be an object for ${key} at index ${value.indexOf(record)}`
                    );
                });

                // CAA: { flags: number, tag: string, value: string }[]
                if (key === "CAA") {
                    value.forEach((record) => {
                        t.true(
                            typeof record.flags === "number",
                            `${file}: CAA record value should have a number for flags at index ${value.indexOf(record)}`
                        );

                        t.true(
                            typeof record.tag === "string",
                            `${file}: CAA record value should have a string for tag at index ${value.indexOf(record)}`
                        );

                        t.true(
                            typeof record.value === "string",
                            `${file}: CAA record value should have a string for value at index ${value.indexOf(record)}`
                        );
                    });
                }

                // DS: { key_tag: number, algorithm: number, digest_type: number, digest: string }[]
                if (key === "DS") {
                    value.forEach((record) => {
                        t.true(
                            typeof record.key_tag === "number",
                            `${file}: DS record value should have a number for key_tag at index ${value.indexOf(
                                record
                            )}`
                        );

                        t.true(
                            typeof record.algorithm === "number",
                            `${file}: DS record value should have a number for algorithm at index ${value.indexOf(
                                record
                            )}`
                        );

                        t.true(
                            typeof record.digest_type === "number",
                            `${file}: DS record value should have a number for digest_type at index ${value.indexOf(
                                record
                            )}`
                        );

                        t.true(
                            typeof record.digest === "string",
                            `${file}: DS record value should have a string for digest at index ${value.indexOf(record)}`
                        );
                    });
                }

                // SRV: { priority: number, weight: number, port: number, target: string }[]
                if (key === "SRV") {
                    value.forEach((record) => {
                        t.true(
                            typeof record.priority === "number",
                            `${file}: SRV record value should have a number for priority at index ${value.indexOf(
                                record
                            )}`
                        );

                        t.true(
                            typeof record.weight === "number",
                            `${file}: SRV record value should have a number for weight at index ${value.indexOf(
                                record
                            )}`
                        );

                        t.true(
                            typeof record.port === "number",
                            `${file}: SRV record value should have a number for port at index ${value.indexOf(record)}`
                        );

                        t.true(
                            typeof record.target === "string",
                            `${file}: SRV record value should have a string for target at index ${value.indexOf(
                                record
                            )}`
                        );

                        t.regex(
                            value.target,
                            hostnameRegex,
                            `${file}: SRV record value should be a valid hostname for target at index ${value.indexOf(
                                record
                            )}`
                        );
                    });
                }
            }

            // TXT: string | string[]
            if (key === "TXT") {
                if (Array.isArray(value)) {
                    value.forEach((record) => {
                        t.true(
                            typeof record === "string",
                            `${file}: Record value should be a string for ${key} at index ${value.indexOf(record)}`
                        );
                    });
                } else {
                    t.true(typeof value === "string", `${file}: Record value should be a string for ${key}`);
                }
            }
        });
    });
});
