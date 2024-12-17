const t = require("ava");
const fs = require("fs-extra");
const path = require("path");

const validRecordTypes = new Set(["A", "AAAA", "CAA", "CNAME", "DS", "MX", "NS", "SRV", "TXT", "URL"]);

const hostnameRegex = /^(?=.{1,253}$)(?:(?:[_a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)\.)+[a-zA-Z]{2,63}$/;
const ipv4Regex = /^(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}$/;
const ipv6Regex =
    /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::(?:[0-9a-fA-F]{1,4}:){0,6}[0-9a-fA-F]{1,4}$|^(?:[0-9a-fA-F]{1,4}:){1,7}:$|^(?:[0-9a-fA-F]{1,4}:){0,6}::(?:[0-9a-fA-F]{1,4}:){0,5}[0-9a-fA-F]{1,4}$/;

const domainsPath = path.resolve("domains");
const files = fs.readdirSync(domainsPath);

function expandIPv6(ip) {
    let segments = ip.split(":");

    const emptyIndex = segments.indexOf("");

    if (emptyIndex !== -1) {
        const nonEmptySegments = segments.filter((seg) => seg !== "");
        const missingSegments = 8 - nonEmptySegments.length;

        segments = [
            ...nonEmptySegments.slice(0, emptyIndex),
            ...Array(missingSegments).fill("0000"),
            ...nonEmptySegments.slice(emptyIndex)
        ];
    }

    return segments.map((segment) => segment.padStart(4, "0")).join(":");
}

function validateIPv4(ip, proxied, file, index) {
    const parts = ip.split(".").map(Number);

    if (parts.length !== 4 || parts.some((part) => isNaN(part) || part < 0 || part > 255)) return false;
    if (ip === "192.0.2.1" && proxied) return true;

    return !(
        parts[0] === 10 ||
        (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
        (parts[0] === 192 && parts[1] === 168) ||
        (parts[0] === 100 && parts[1] >= 64 && parts[1] <= 127) ||
        (parts[0] === 169 && parts[1] === 254) ||
        (parts[0] === 192 && parts[1] === 0 && parts[2] === 0) ||
        (parts[0] === 192 && parts[1] === 0 && parts[2] === 2) ||
        (parts[0] === 198 && parts[1] === 18) ||
        (parts[0] === 198 && parts[1] === 51 && parts[2] === 100) ||
        (parts[0] === 203 && parts[1] === 0 && parts[2] === 113) ||
        parts[0] >= 224
    );
}

function validateIPv6(ip) {
    return !(
        ip.toLowerCase().startsWith("fc") ||
        ip.toLowerCase().startsWith("fd") ||
        ip.toLowerCase().startsWith("fe80") ||
        ip.toLowerCase().startsWith("::1") ||
        ip.toLowerCase().startsWith("2001:db8")
    );
}

function validateRecordType(recordType) {
    return validRecordTypes.has(recordType);
}

function isValidHostname(hostname) {
    return hostnameRegex.test(hostname);
}

function isValidHexadecimal(value) {
    return /^[0-9a-fA-F]+$/.test(value);
}

t("All files should have valid record types", (t) => {
    files.forEach((file) => {
        const data = fs.readJsonSync(path.join(domainsPath, file));
        const recordKeys = Object.keys(data.record);

        recordKeys.forEach((key) => {
            t.true(validateRecordType(key), `${file}: Invalid record type: ${key}`);
        });

        // Specific record rules for CNAME, NS, and DS
        if (recordKeys.includes("CNAME") && !data.proxied) {
            t.is(recordKeys.length, 1, `${file}: CNAME records cannot be combined with other records unless proxied`);
        }

        if (recordKeys.includes("NS")) {
            t.true(
                recordKeys.length === 1 || (recordKeys.length === 2 && recordKeys.includes("DS")),
                `${file}: NS records cannot be combined with other records, except for DS records`
            );
        }

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
            const subdomain = file.replace(/\.json$/, ""); // Get the subdomain from the filename

            // Validate A, AAAA, MX, NS records: Array of strings
            if (["A", "AAAA", "MX", "NS"].includes(key)) {
                t.true(Array.isArray(value), `${file}: Record value for ${key} should be an array`);

                value.forEach((record, idx) => {
                    t.true(
                        typeof record === "string",
                        `${file}: Record value for ${key} should be a string at index ${idx}`
                    );

                    if (key === "A") {
                        t.regex(record, ipv4Regex, `${file}: Invalid IPv4 address for ${key} at index ${idx}`);
                        t.true(
                            validateIPv4(record, data.proxied, file, idx),
                            `${file}: Invalid IPv4 address for ${key} at index ${idx}`
                        );
                    }

                    if (key === "AAAA") {
                        t.regex(
                            expandIPv6(record),
                            ipv6Regex,
                            `${file}: Invalid IPv6 address for ${key} at index ${idx}`
                        );
                        t.true(validateIPv6(record), `${file}: Invalid IPv6 address for ${key} at index ${idx}`);
                    }

                    if (["MX", "NS"].includes(key)) {
                        t.true(isValidHostname(record), `${file}: Invalid hostname for ${key} at index ${idx}`);
                    }
                });
            }

            // Validate CNAME and URL records: Single string
            if (["CNAME", "URL"].includes(key)) {
                t.true(typeof value === "string", `${file}: Record value for ${key} should be a string`);

                if (key === "CNAME") {
                    t.true(isValidHostname(value), `${file}: Invalid hostname for ${key}`);
                    t.true(value !== file, `${file}: CNAME cannot point to itself`);
                    if (file === "@.json") {
                        t.true(value !== "is-a.dev", `${file}: CNAME cannot point to itself`);
                    }
                }

                if (key === "URL") {
                    t.notThrows(() => new URL(value), `${file}: Invalid URL for ${key}`);
                    try {
                        const urlObj = new URL(value);
                        t.true(urlObj.hostname !== subdomain, `${file}: URL cannot point to itself`);
                    } catch {
                        t.fail(`${file}: Invalid URL for ${key}`);
                    }
                }
            }

            // Validate CAA, DS, SRV records: Array of objects
            if (["CAA", "DS", "SRV"].includes(key)) {
                t.true(Array.isArray(value), `${file}: Record value for ${key} should be an array`);

                value.forEach((record, idx) => {
                    t.true(
                        typeof record === "object",
                        `${file}: Record value for ${key} should be an object at index ${idx}`
                    );

                    if (key === "DS") {
                        t.true(
                            Number.isInteger(record.key_tag) && record.key_tag >= 0 && record.key_tag <= 65535,
                            `${file}: Invalid key_tag for DS at index ${idx}`
                        );
                        t.true(isValidHexadecimal(record.digest), `${file}: Invalid digest for DS at index ${idx}`);
                    }
                });
            }

            // TXT: Single string or array of strings
            if (key === "TXT") {
                if (Array.isArray(value)) {
                    value.forEach((record, idx) => {
                        t.true(
                            typeof record === "string",
                            `${file}: TXT record value should be a string at index ${idx}`
                        );
                    });
                } else {
                    t.true(typeof value === "string", `${file}: TXT record value should be a string`);
                }
            }
        });
    });
});
