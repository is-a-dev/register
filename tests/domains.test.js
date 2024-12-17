const t = require("ava");
const fs = require("fs-extra");
const path = require("path");

const domainsPath = path.resolve("domains");
const files = fs.readdirSync(domainsPath);

function getParentSubdomain(subdomain) {
    const parts = subdomain.split(".");
    
    if (parts.length <= 1) return null; // No parent for top-level subdomains
    
    // Attempt to find the parent subdomain by removing the last part
    for (let i = parts.length - 1; i > 0; i--) {
        const potentialParent = parts.slice(i - 1).join(".");
        if (files.includes(`${potentialParent}.json`)) {
            return potentialParent; // Return the parent subdomain if it exists
        }
    }
    
    return null; // Return null if no valid parent is found
}


function getDomainData(subdomain) {
    try {
        return fs.readJsonSync(path.join(domainsPath, `${subdomain}.json`));
    } catch (error) {
        throw new Error(`Failed to read JSON for ${subdomain}: ${error.message}`);
    }
}

t("Nested subdomains should not exist without a parent subdomain", (t) => {
    for (const file of files) {
        const subdomain = file.replace(/\.json$/, "");

        if (subdomain.split(".").length > 1) {
            const parentSubdomain = getParentSubdomain(subdomain);
            t.true(files.includes(`${parentSubdomain}.json`), `${file}: Parent subdomain does not exist`);
        }
    }

    t.pass();
});

t("Nested subdomains should not exist if the parent subdomain has NS records", (t) => {
    for (const file of files) {
        const subdomain = file.replace(/\.json$/, "");

        if (subdomain.split(".").length > 1) {
            const parentSubdomain = getParentSubdomain(subdomain);
            const parentDomain = getDomainData(parentSubdomain);

            t.true(!parentDomain.record.NS, `${file}: Parent subdomain has NS records`);
        }
    }

    t.pass();
});

t("Nested subdomains should be owned by the parent subdomain's owner", (t) => {
    for (const file of files) {
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
    }
});
