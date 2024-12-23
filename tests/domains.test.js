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

function expandReservedDomains() {
    const reserved = require("../util/reserved-domains.json");
    const expandedList = [...reserved];

    for (const item of reserved) {
        const rangeMatch = item.match(/\[(\d+)-(\d+)\]/); // Matches [min-max]

        if (rangeMatch) {
            const prefix = item.split("[")[0];
            const start = parseInt(rangeMatch[1], 10);
            const end = parseInt(rangeMatch[2], 10);

            if (start < end) {
                for (let i = start; i <= end; i++) {
                    expandedList.push(prefix + i);
                }

                expandedList.splice(expandedList.indexOf(item), 1);
            } else {
                throw new Error(`[util/reserved-domains.json] Invalid range [${start}-${end}] in "${item}"`);
            }
        }
    }

    return expandedList;
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

const reservedDomains = expandReservedDomains();

t("Subdomain names must not be reserved", (t) => {
    for (const file of files) {
        const subdomain = file.replace(/\.json$/, "");

        t.true(!reservedDomains.includes(subdomain), `${file}: Subdomain name is reserved`);
    }

    t.pass();
});

t("Reserved domains file should be valid", (t) => {
    const subdomainRegex = /^_?[a-zA-Z0-9]+([-\.][a-zA-Z0-9]+)*(\[\d+-\d+\])?$/;

    for (const item of reservedDomains) {
        t.regex(
            item,
            subdomainRegex,
            `[util/reserved-domains.json] Invalid subdomain name "${item}" at index ${reservedDomains.indexOf(item)}`
        );
    }

    t.pass();
});
