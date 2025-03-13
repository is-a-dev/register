const t = require("ava");
const fs = require("fs-extra");
const path = require("path");

const domainsPath = path.resolve("domains");
const files = fs.readdirSync(domainsPath).filter((file) => file.endsWith(".json"));

const domainCache = {};

function getDomainData(subdomain) {
    if (domainCache[subdomain]) {
        return domainCache[subdomain];
    }

    try {
        const data = fs.readJsonSync(path.join(domainsPath, `${subdomain}.json`));
        domainCache[subdomain] = data; // Cache the domain data
        return data;
    } catch (error) {
        throw new Error(`Failed to read JSON for ${subdomain}: ${error.message}`);
    }
}

t("Nested subdomains should not exist without a parent subdomain", (t) => {
    files.forEach((file) => {
        const subdomain = file.replace(/\.json$/, "");
        const parentDomain = subdomain.split(".").reverse()[0];

        if (parentDomain !== subdomain) {
            t.true(
                parentDomain && files.includes(`${parentDomain}.json`),
                `${file}: Parent subdomain does not exist`
            );
        }
    });
});

t("Nested subdomains should not exist if the parent subdomain has NS records", (t) => {
    files.forEach((file) => {
        const subdomain = file.replace(/\.json$/, "");
        const parentDomain = subdomain.split(".").reverse()[0];

        if (parentDomain !== subdomain) {
            const parentData = getDomainData(parentDomain);

            t.true(!parentData.record.NS, `${file}: Parent subdomain has NS records`);
        }
    });
});

t("Nested subdomains should be owned by the parent subdomain's owner", (t) => {
    files.forEach((file) => {
        const subdomain = file.replace(/\.json$/, "");
        const parentDomain = subdomain.split(".").reverse()[0];

        if (parentDomain !== subdomain) {
            const data = getDomainData(subdomain);
            const parentData = getDomainData(parentDomain);

            t.true(
                data.owner.username.toLowerCase() === parentData.owner.username.toLowerCase(),
                `${file}: Owner does not match the parent subdomain`
            );
        }
    });
});
