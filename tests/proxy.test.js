const t = require("ava");
const fs = require("fs-extra");
const path = require("path");

const requiredRecordsToProxy = new Set(["A", "AAAA", "CNAME"]);
// URL records are not listed here because they are proxied by default, so they don't need the proxied flag

function validateProxiedRecords(t, data, file) {
    // Convert the Set to an array for message display
    const recordTypes = Array.from(requiredRecordsToProxy).join(", ");

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

t("Domains with proxy enabled should have at least one record that can be proxied", (t) => {
    files.forEach((file) => {
        const domain = fs.readJsonSync(path.join(domainsPath, file));

        validateProxiedRecords(t, domain, file);
    });
});
