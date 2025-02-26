const t = require("ava");
const fs = require("fs-extra");
const path = require("path");

const validRecordTypes = new Set([
    "A",
    "AAAA",
    "CAA",
    "CNAME",
    "DS",
    "MX",
    "NS",
    "SRV",
    "TXT",
    "URL",
]);
const hostnameRegex =
    /^(?=.{1,253}$)(?:(?:[_a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)\.)+[a-zA-Z]{2,63}$/;
const ipv4Regex =
    /^(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}$/;
const ipv6Regex =
    /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::(?:[0-9a-fA-F]{1,4}:){0,6}[0-9a-fA-F]{1,4}$|^(?:[0-9a-fA-F]{1,4}:){1,7}:$|^(?:[0-9a-fA-F]{1,4}:){0,6}::(?:[0-9a-fA-F]{1,4}:){0,5}[0-9a-fA-F]{1,4}$/;

const domainsPath = path.resolve("domains");
const files = fs
    .readdirSync(domainsPath)
    .filter((file) => file.endsWith(".json"));

const domainCache = {};

function getDomainData(file) {
    if (domainCache[file]) {
        return domainCache[file];
    }

    try {
        const data = fs.readJsonSync(path.join(domainsPath, file));
        domainCache[file] = data;
        return data;
    } catch (error) {
        throw new Error(`Failed to read JSON for ${file}: ${error.message}`);
    }
}

function expandIPv6(ip) {
    let segments = ip.split(":");
    const emptyIndex = segments.indexOf("");

    if (emptyIndex !== -1) {
        const nonEmptySegments = segments.filter((seg) => seg !== "");
        const missingSegments = 8 - nonEmptySegments.length;

        segments = [
            ...nonEmptySegments.slice(0, emptyIndex),
            ...Array(missingSegments).fill("0000"),
            ...nonEmptySegments.slice(emptyIndex),
        ];
    }

    return segments.map((segment) => segment.padStart(4, "0")).join(":");
}

function validateIPv4(ip, proxied) {
    const parts = ip.split(".").map(Number);

    if (
        parts.length !== 4 ||
        parts.some((part) => isNaN(part) || part < 0 || part > 255)
    )
        return false;
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

function validateRecordValues(t, data, file) {
    const subdomain = file.replace(/\.json$/, "");

    Object.entries(data.record).forEach(([key, value]) => {
        // General validation for arrays
        if (["A", "AAAA", "MX", "NS"].includes(key)) {
            t.true(
                Array.isArray(value),
                `${file}: Record value for ${key} should be an array`,
            );

            value.forEach((record, idx) => {
                t.true(
                    typeof record === "string",
                    `${file}: Record value for ${key} should be a string at index ${idx}`,
                );

                if (key === "A") {
                    t.true(
                        ipv4Regex.test(record),
                        `${file}: Invalid IPv4 address for ${key} at index ${idx}`,
                    );
                    t.true(
                        validateIPv4(record, data.proxied),
                        `${file}: Invalid IPv4 address for ${key} at index ${idx}`,
                    );
                } else if (key === "AAAA") {
                    const expandedIPv6 = expandIPv6(record);
                    t.true(
                        ipv6Regex.test(expandedIPv6),
                        `${file}: Invalid IPv6 address for ${key} at index ${idx}`,
                    );
                    t.true(
                        validateIPv6(expandedIPv6),
                        `${file}: Invalid IPv6 address for ${key} at index ${idx}`,
                    );
                } else if (["MX", "NS"].includes(key)) {
                    t.true(
                        isValidHostname(record),
                        `${file}: Invalid hostname for ${key} at index ${idx}`,
                    );
                }
            });
        }

        // CNAME and URL validations
        if (["CNAME", "URL"].includes(key)) {
            t.true(
                typeof value === "string",
                `${file}: Record value for ${key} should be a string`,
            );

            if (key === "CNAME") {
                t.true(
                    isValidHostname(value),
                    `${file}: Invalid hostname for ${key}`,
                );
                t.false(
                    value.startsWith("http://") || value.startsWith("https://"),
                    `${file}: CNAME record cannot be a URL`,
                );

                t.false(
                    value.includes("/"),
                    `${file}: CNAME record cannot contain url paths`,
                );

                t.true(value !== file, `${file}: CNAME cannot point to itself`);
            } else if (key === "URL") {
                t.true(
                    value.startsWith("http://") || value.startsWith("https://"),
                    `${file}: Record value for ${key} must start with http:// or https://`,
                );
                t.notThrows(
                    () => new URL(value),
                    `${file}: Invalid URL for ${key}`,
                );

                const urlHost = new URL(value).host;
                const isSelfReferencing =
                    file === "@.json"
                        ? urlHost === "is-a.dev"
                        : urlHost === `${subdomain}.is-a.dev`;

                t.false(
                    isSelfReferencing,
                    `${file}: URL cannot point to itself`,
                );
            }
        }

        // CAA, DS, SRV validations
        if (["CAA", "DS", "SRV"].includes(key)) {
            t.true(
                Array.isArray(value),
                `${file}: Record value for ${key} should be an array`,
            );

            value.forEach((record, idx) => {
                t.true(
                    typeof record === "object",
                    `${file}: Record value for ${key} should be an object at index ${idx}`,
                );

                if (key === "CAA") {
                    t.true(
                        ["issue", "issuewild", "iodef"].includes(record.tag),
                        `${file}: Invalid tag for CAA at index ${idx}`,
                    );
                    t.true(
                        typeof record.value === "string",
                        `${file}: Invalid value for CAA at index ${idx}`,
                    );
                    t.true(
                        isValidHostname(record.value) || record.value === ";",
                        `${file}: Value must be a hostname or semicolon for CAA at index ${idx}`,
                    );
                } else if (key === "DS") {
                    t.true(
                        Number.isInteger(record.key_tag) &&
                            record.key_tag >= 0 &&
                            record.key_tag <= 65535,
                        `${file}: Invalid key_tag for DS at index ${idx}`,
                    );
                    t.true(
                        Number.isInteger(record.algorithm) &&
                            record.algorithm >= 0 &&
                            record.algorithm <= 255,
                        `${file}: Invalid algorithm for DS at index ${idx}`,
                    );
                    t.true(
                        Number.isInteger(record.digest_type) &&
                            record.digest_type >= 0 &&
                            record.digest_type <= 255,
                        `${file}: Invalid digest_type for DS at index ${idx}`,
                    );
                    t.true(
                        isValidHexadecimal(record.digest),
                        `${file}: Invalid digest for DS at index ${idx}`,
                    );
                } else if (key === "SRV") {
                    t.true(
                        Number.isInteger(record.priority) &&
                            record.priority >= 0 &&
                            record.priority <= 65535,
                        `${file}: Invalid priority for SRV at index ${idx}`,
                    );
                    t.true(
                        Number.isInteger(record.weight) &&
                            record.weight >= 0 &&
                            record.weight <= 65535,
                        `${file}: Invalid weight for SRV at index ${idx}`,
                    );
                    t.true(
                        Number.isInteger(record.port) &&
                            record.port >= 0 &&
                            record.port <= 65535,
                        `${file}: Invalid port for SRV at index ${idx}`,
                    );
                    t.true(
                        isValidHostname(record.target),
                        `${file}: Invalid target for SRV at index ${idx}`,
                    );
                }
            });
        }

        // TXT validation
        if (key === "TXT") {
            const values = Array.isArray(value) ? value : [value];
            values.forEach((record, idx) => {
                t.true(
                    typeof record === "string",
                    `${file}: TXT record value should be a string at index ${idx}`,
                );
            });
        }
    });

    if (data.redirect_config) {
        const customPaths = Object.keys(
            data.redirect_config.custom_paths || {},
        );
        const pathRegex = /^\/[a-zA-Z0-9\-_\.\/]+(?<!\/)$/;

        customPaths.forEach((customPath, idx) => {
            const customRedirectURL =
                data.redirect_config.custom_paths[customPath];
            const urlMessage = `${file}: Custom path in redirect_config`;

            // Validate the custom path
            t.true(
                pathRegex.test(customPath),
                `${urlMessage} must start with a slash, contain only alphanumeric characters, hyphens, underscores, periods, and slashes, and cannot end with a slash at index ${idx}`,
            );
            t.true(
                customPath.length >= 2 && customPath.length <= 255,
                `${urlMessage} should be 2-255 characters long at index ${idx}`,
            );

            // Validate the redirect URL
            t.true(
                data.record.URL !== customRedirectURL,
                `${urlMessage} should be different from the URL record at index ${idx}`,
            );
            t.true(
                customRedirectURL.startsWith("http://") ||
                    customRedirectURL.startsWith("https://"),
                `${urlMessage} must start with http:// or https:// at index ${idx}`,
            );
            t.notThrows(
                () => new URL(customRedirectURL),
                `${urlMessage} contains an invalid URL at index ${idx}`,
            );

            // Check for self-referencing redirects
            const urlHost = new URL(customRedirectURL).host;
            const isSelfReferencing =
                file === "@.json"
                    ? urlHost === "is-a.dev"
                    : urlHost === `${subdomain}.is-a.dev`;
            t.false(
                isSelfReferencing,
                `${urlMessage} cannot point to itself at index ${idx}`,
            );
        });
    }
}

t("All files should have valid record types", (t) => {
    files.forEach((file) => {
        const data = getDomainData(file);
        const recordKeys = Object.keys(data.record);

        recordKeys.forEach((key) => {
            t.true(
                validateRecordType(key),
                `${file}: Invalid record type: ${key}`,
            );
        });

        // Record type combinations validation
        if (recordKeys.includes("CNAME") && !data.proxied) {
            t.is(
                recordKeys.length,
                1,
                `${file}: CNAME records cannot be combined with other records unless proxied`,
            );
        }
        if (recordKeys.includes("NS")) {
            t.true(
                recordKeys.length === 1 ||
                    (recordKeys.length === 2 && recordKeys.includes("DS")),
                `${file}: NS records cannot be combined with other records, except for DS records`,
            );
        }
        if (recordKeys.includes("DS")) {
            t.true(
                recordKeys.includes("NS"),
                `${file}: DS records must be combined with NS records`,
            );
        }
        if (recordKeys.includes("URL")) {
            t.true(
                !recordKeys.includes("A") &&
                    !recordKeys.includes("AAAA") &&
                    !recordKeys.includes("CNAME"),
                `${file}: URL records cannot be combined with A, AAAA, or CNAME records`,
            );
        }
        if (data.redirect_config) {
            t.true(
                recordKeys.includes("URL") || data.proxied,
                `${file}: Redirect config must be combined with a URL record or the domain must be proxied`,
            );
            if (data.redirect_config.redirect_paths) {
                t.true(
                    recordKeys.includes("URL"),
                    `${file}: redirect_config.redirect_paths requires a URL record`,
                );
            }
        }

        validateRecordValues(t, data, file);
    });

    t.pass();
});
