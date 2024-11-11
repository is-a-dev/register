const t = require("ava");
const fs = require("fs-extra");
const path = require("path");

const domainsPath = path.resolve("domains");
const files = fs.readdirSync(domainsPath);

t("Nested subdomains should not exist without a parent subdomain", (t) => {
    files.forEach((file) => {
        const subdomain = file.replace(".json", "");

        if (subdomain.split(".").length > 1) {
            const parentSubdomain = subdomain.split(".").pop();

            t.true(files.includes(`${parentSubdomain}.json`), `${file}: Parent subdomain does not exist`);
        }
    });

    t.pass();
});

t("Nested subdomains should not exist if the parent subdomain has NS records", (t) => {
    files.forEach((file) => {
        const subdomain = file.replace(".json", "");

        if (subdomain.split(".").length > 1) {
            const parentSubdomain = subdomain.split(".").pop();
            const parentDomain = fs.readJsonSync(path.join(domainsPath, `${parentSubdomain}.json`));

            t.is(parentDomain.record.NS, undefined, `${file}: Parent subdomain has NS records`);
        }
    });

    t.pass();
});
