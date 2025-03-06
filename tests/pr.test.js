const t = require("ava");
const fs = require("fs-extra");
const path = require("path");

const domainsPath = path.resolve("domains");
const files = fs.readdirSync(domainsPath).filter((file) => file.endsWith(".json"));

const changedFiles = JSON.parse(process.env.CHANGED_FILES);
const prAuthor = process.env.PR_AUTHOR.toLowerCase();
const prLabels = JSON.parse(process.env.PR_LABELS);
const trustedUsers = require("../util/trusted.json").map((u) => u.toLowerCase());

function getDomainData(subdomain) {
    try {
        const data = fs.readJsonSync(path.join(domainsPath, `${subdomain}.json`));
        return data;
    } catch (error) {
        throw new Error(`Failed to read JSON for ${subdomain}: ${error.message}`);
    }
}

t("Users can only update their own subdomains", (t) => {
    if (process.env.PR_AUTHOR && process.env.CHANGED_FILES) {
        const changedJSONFiles = changedFiles
            .filter((file) => file.startsWith("domains/"))
            .map((file) => path.basename(file))
            .forEach((file) => file.replace(/\.json$/, ""));

        if (trustedUsers.includes(prAuthor) || prLabels.includes("bypass-owner-check")) {
            t.pass();
        } else {
            files
                .filter((file) => changedJSONFiles.includes(file))
                .forEach((file) => {
                    const subdomain = file.replace(/\.json$/, "");
                    const data = getDomainData(subdomain);

                    t.true(
                        data.owner.username.toLowerCase() === prAuthor,
                        `${subdomain}: ${prAuthor} does not own ${subdomain}.is-a.dev`
                    );
                });
        }
    }

    t.pass();
});
