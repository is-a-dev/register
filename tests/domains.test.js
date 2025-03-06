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

function getParentSubdomain(subdomain) {
    const parts = subdomain.split(".");

    if (parts.length <= 1) return null; // No parent for top-level subdomains

    // Try to find the parent subdomain by iterating over the parts
    for (let i = parts.length - 1; i > 0; i--) {
        const potentialParent = parts.slice(i - 1).join(".");

        if (files.includes(`${potentialParent}.json`)) {
            return potentialParent;
        }
    }

    return null;
}

t("Nested subdomains should not exist without a parent subdomain", (t) => {
    files.forEach((file) => {
        const subdomain = file.replace(/\.json$/, "");

        if (subdomain.split(".").length > 1) {
            const parentSubdomain = getParentSubdomain(subdomain);
            t.true(
                parentSubdomain && files.includes(`${parentSubdomain}.json`),
                `${file}: Parent subdomain does not exist`
            );
        }
    });
});

t("Nested subdomains should not exist if the parent subdomain has NS records", (t) => {
    files.forEach((file) => {
        const subdomain = file.replace(/\.json$/, "");

        if (subdomain.split(".").length > 1) {
            const parentSubdomain = getParentSubdomain(subdomain);
            const parentDomain = getDomainData(parentSubdomain);

            t.true(!parentDomain.record.NS, `${file}: Parent subdomain has NS records`);
        }
    });
});

t("Nested subdomains should be owned by the parent subdomain's owner", (t) => {
    files.forEach((file) => {
        const subdomain = file.replace(/\.json$/, "");

        if (subdomain.split(".").length > 1) {
            const data = getDomainData(subdomain);
            const parentSubdomain = getParentSubdomain(subdomain);
            const parentDomain = getDomainData(parentSubdomain);

            t.true(
                data.owner.username.toLowerCase() === parentDomain.owner.username.toLowerCase(),
                `${file}: Owner does not match the parent subdomain`
            );
        }
    });
});
