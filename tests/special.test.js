const t = require("ava");
const fs = require("fs-extra");
const path = require("path");

const domainsPath = path.resolve("domains");
const files = fs.readdirSync(domainsPath).filter((file) => file.endsWith(".json"));

const bypassedUsernames = require("../util/bypassed.json").map((username) => username.toLowerCase());

function getDomainData(subdomain) {
    try {
        const data = fs.readJsonSync(path.join(domainsPath, `${subdomain}.json`));
        return data;
    } catch (error) {
        throw new Error(`Failed to read JSON for ${subdomain}: ${error.message}`);
    }
}

t("Users are limited to one single character subdomain", (t) => {
    const results = [];

    files.forEach((file) => {
        const subdomain = file.replace(/\.json$/, "");
        const data = getDomainData(subdomain);

        if (subdomain.length === 1 && !bypassedUsernames.includes(data.owner.username.toLowerCase())) {
            results.push({
                subdomain,
                owner: data.owner.username.toLowerCase()
            });
        }
    });

    const duplicates = results.filter((result) => results.filter((r) => r.owner === result.owner).length > 1);
    const output = duplicates.reduce((acc, curr) => {
        if (!acc[curr.owner]) {
            acc[curr.owner] = [];
        }

        acc[curr.owner].push(`${curr.subdomain}.is-a.dev`);
        return acc;
    }, {});

    t.is(
        duplicates.length,
        0,
        Object.keys(output)
            .map((owner) => `${owner} - ${output[owner].join(", ")}`)
            .join("\n")
    );

    t.pass();
});
