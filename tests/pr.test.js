if (!process.env.PULL_REQUEST) return;

const t = require("ava");
const fs = require("fs-extra");
const path = require("path");

const PR_AUTHOR = process.env.PR_AUTHOR;
const MODIFIED_FILES = process.env.MODIFIED_FILES.split(",");

const domainsPath = path.resolve("domains");

const admins = require("../util/administrators.json");

t("Modified JSON files must be owned by the PR author", (t) => {
    MODIFIED_FILES.forEach((file) => {
        const domain = fs.readJsonSync(path.join(domainsPath, file));

        t.true(
            domain.owner.username === PR_AUTHOR || admins.includes(PR_AUTHOR),
            `${file}: Owner should be ${PR_AUTHOR} but is ${domain.owner}`
        );
    });
});
