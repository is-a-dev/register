const t = require("ava");
const fs = require("fs-extra");
const path = require("path");

const {
    checkCNAME,
    checkNSAndDS,
    validateHostname,
    validateIPv4,
    validateIPv6,
    validateSpecialRecords,
    validateTXT,
    validateURL
} = require("../utils/records");

const validRecordTypes = ["A", "AAAA", "CAA", "CNAME", "DS", "MX", "NS", "SRV", "TXT", "URL"];

const domainsPath = path.resolve("domains");
const files = fs.readdirSync(domainsPath);

t("All files should have valid record types", (t) => {
    files.forEach((file) => {
        const data = fs.readJsonSync(path.join(domainsPath, file));
        const recordKeys = Object.keys(data.record);

        recordKeys.forEach((key) => {
            t.true(validRecordTypes.includes(key), `${file}: Invalid record type: ${key}`);
        });

        checkCNAME(t, file, recordKeys);
        checkNSAndDS(t, file, recordKeys);
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

            if (["A", "AAAA", "MX", "NS"].includes(key)) {
                t.true(Array.isArray(value), `${file}: Record value should be an array for ${key}`);

                value.forEach((record) =>
                    t.true(typeof record === "string", `${file}: Record value should be a string for ${key}`)
                );

                if (key === "A") validateIPv4(t, file, key, value, data);
                if (key === "AAAA") validateIPv6(t, file, key, value);
                if (["MX", "NS"].includes(key)) validateHostname(t, file, key, value);
            } else if (["CNAME", "URL"].includes(key)) {
                t.true(typeof value === "string", `${file}: Record value should be a string for ${key}`);

                if (key === "CNAME") validateHostname(t, file, key, [value]);
                if (key === "URL") validateURL(t, file, key, value);
            } else if (["CAA", "DS", "SRV"].includes(key)) {
                t.true(Array.isArray(value), `${file}: Record value should be an array for ${key}`);

                value.forEach((record) =>
                    t.true(typeof record === "object", `${file}: Record value should be an object for ${key}`)
                );

                validateSpecialRecords(t, file, key, value);
            } else if (key === "TXT") {
                validateTXT(t, file, key, value);
            }
        });
    });
});
