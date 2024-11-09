const { expandIPv6, isPublicIPv4, isPublicIPv6 } = require("./functions");

const hostnameRegex = /^(?=.{1,253}$)(?:(?:[_a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)\.)+[a-zA-Z]{2,63}$/;
const ipv4Regex = /^(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}$/;
const ipv6Regex =
    /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::(?:[0-9a-fA-F]{1,4}:){0,6}[0-9a-fA-F]{1,4}$|^(?:[0-9a-fA-F]{1,4}:){1,7}:$|^(?:[0-9a-fA-F]{1,4}:){0,6}::(?:[0-9a-fA-F]{1,4}:){0,5}[0-9a-fA-F]{1,4}$/;

// Check CNAME records
function checkCNAME(t, file, recordKeys) {
    if (recordKeys.includes("CNAME")) {
        t.is(recordKeys.length, 1, `${file}: CNAME records cannot be combined with other records`);
    }
}

// Check NS and DS records
function checkNSAndDS(t, file, recordKeys) {
    if (recordKeys.includes("NS")) {
        t.true(
            recordKeys.length === 1 || (recordKeys.length === 2 && recordKeys.includes("DS")),
            `${file}: NS records cannot be combined with other records, except for DS records`
        );
    }

    if (recordKeys.includes("DS")) {
        t.true(recordKeys.includes("NS"), `${file}: DS records must be combined with NS records`);
    }
}

// Validate IPv4 record
function validateIPv4(t, file, key, value, data) {
    value.forEach((record) => {
        t.regex(record, ipv4Regex, `${file}: Record value should be a valid IPv4 address for ${key}`);
        t.true(isPublicIPv4(record, data.proxied), `${file}: Record value should be a public IPv4 address for ${key}`);
    });
}

// Validate IPv6 record
function validateIPv6(t, file, key, value) {
    value.forEach((record) => {
        t.regex(expandIPv6(record), ipv6Regex, `${file}: Record value should be a valid IPv6 address for ${key}`);
        t.true(isPublicIPv6(record), `${file}: Record value should be a public IPv6 address for ${key}`);
    });
}

// Validate hostname record
function validateHostname(t, file, key, value) {
    value.forEach((record) => {
        t.regex(record, hostnameRegex, `${file}: Record value should be a valid hostname for ${key}`);
    });
}

// Validate URL record
function validateURL(t, file, key, value) {
    try {
        new URL(value);
    } catch (error) {
        t.fail(`${file}: Record value should be a valid URL for ${key}`);
    }
}

// Validate special records (CAA, DS, SRV)
function validateSpecialRecords(t, file, key, value) {
    if (key === "CAA") {
        value.forEach((record) => {
            t.true(typeof record.flags === "number", `${file}: CAA record value should have a number for flags`);
            t.true(typeof record.tag === "string", `${file}: CAA record value should have a string for tag`);
            t.true(typeof record.value === "string", `${file}: CAA record value should have a string for value`);
        });
    }
    if (key === "DS") {
        value.forEach((record) => {
            t.true(typeof record.key_tag === "number", `${file}: DS record value should have a number for key_tag`);
            t.true(typeof record.algorithm === "number", `${file}: DS record value should have a number for algorithm`);
            t.true(
                typeof record.digest_type === "number",
                `${file}: DS record value should have a number for digest_type`
            );
            t.true(typeof record.digest === "string", `${file}: DS record value should have a string for digest`);
        });
    }
    if (key === "SRV") {
        value.forEach((record) => {
            t.true(typeof record.priority === "number", `${file}: SRV record value should have a number for priority`);
            t.true(typeof record.weight === "number", `${file}: SRV record value should have a number for weight`);
            t.true(typeof record.port === "number", `${file}: SRV record value should have a number for port`);
            t.true(typeof record.target === "string", `${file}: SRV record value should have a string for target`);
            t.regex(record.target, hostnameRegex, `${file}: SRV record value should have a valid hostname for target`);
        });
    }
}

// Validate TXT record
function validateTXT(t, file, key, value) {
    if (Array.isArray(value)) {
        value.forEach((record) =>
            t.true(typeof record === "string", `${file}: Record value should be a string for ${key}`)
        );
    } else {
        t.true(typeof value === "string", `${file}: Record value should be a string for ${key}`);
    }
}

module.exports = {
    checkCNAME,
    checkNSAndDS,
    validateIPv4,
    validateIPv6,
    validateHostname,
    validateURL,
    validateSpecialRecords,
    validateTXT
};
