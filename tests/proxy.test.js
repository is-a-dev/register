const t = require("ava");
const fs = require("fs-extra");
const path = require("path");

const requiredRecordsToProxy = [
    "A",
    "AAAA",
    "CNAME"
];

function validateProxiedRecords(t, data, file) {
    if (data.proxied) {
        const hasProxiedRecord = Object.keys(data.record).some((key) => requiredRecordsToProxy.includes(key));

        t.true(hasProxiedRecord, `${file}: Proxied is true but there are no records that can be proxied`);
    }
};

const domainsPath = path.resolve("domains");
const files = fs.readdirSync(domainsPath);

t("Domains with proxy enabled should have have at least one record that can be proxied", (t) => {
    files.forEach((file) => {
        const domain = fs.readJsonSync(path.join(domainsPath, file));

        validateProxiedRecords(t, domain, file);
    })
});
