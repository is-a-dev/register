const t = require("ava");
const fs = require("fs-extra");
const path = require("path");

const requiredRecordsToProxy = new Set(["A", "AAAA", "CNAME"]);

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

function validateProxiedRecords(t, data, file) {
    const recordTypes = Array.from(requiredRecordsToProxy).join(", ");

    // Forcefully stop raw.is-a.dev from being proxied
    if (file === "raw.json") {
        t.true(!data.proxied, `${file}: raw.is-a.dev cannot be proxied`);
        return;
    }

    if (data.proxied) {
        const hasProxiedRecord = Object.keys(data.record).some((key) => requiredRecordsToProxy.has(key));

        t.true(
            hasProxiedRecord,
            `${file}: Proxied is true but there are no records that can be proxied (${recordTypes} expected)`
        );
    }
}

const domainsPath = path.resolve("domains");
const files = fs.readdirSync(domainsPath).filter((file) => file.endsWith(".json"));

t("Domains with proxy enabled must have at least one proxy-able record", (t) => {
    files.forEach((file) => {
        const data = getDomainData(file);

        validateProxiedRecords(t, data, file);
    });
});
