const t = require("ava");
const fs = require("fs-extra");
const path = require("path");

const PR_AUTHOR = process.env.PR_AUTHOR.toLowerCase();
const MODIFIED_FILES = (process.env.MODIFIED_FILES || "").split(" ").map((file) => file.replace(/^domains\//, ""));
const EVENT = process.env.EVENT;
const RUN_ID = process.env.RUN_ID;

console.log(MODIFIED_FILES)

const domainsPath = path.resolve("domains");
const headDomainsPath = path.resolve(`register-${RUN_ID}/domains`);

const admins = require("../util/administrators.json").map(admin => admin.toLowerCase());

async function getJSONContent(basePath, fileName) {
    try {
        return await fs.readJson(path.join(basePath, fileName));
    } catch {
        return null;
    }
}

t("Modified JSON files must be owned by the PR author", async (t) => {
    if (EVENT !== "pull_request") return t.pass();

    const checks = MODIFIED_FILES.map(async (file) => {
        const [modifiedDomain, currentDomain] = await Promise.all([
            getJSONContent(domainsPath, file),
            getJSONContent(headDomainsPath, file)
        ]);

        const domainToCheck = currentDomain || modifiedDomain;

        if (!modifiedDomain || !domainToCheck) {
            t.fail(`${file}: Unable to read domain data`);
            return;
        }

        t.true(
            domainToCheck.owner.username.toLowerCase() === PR_AUTHOR || admins.includes(PR_AUTHOR),
            `${file}: Domain owner is ${domainToCheck.owner.username.toLowerCase()} but ${PR_AUTHOR} is the PR author`
        );
    });

    await Promise.all(checks);
    t.pass();
});

t("New JSON files must be owned by the PR author", async (t) => {
    if (EVENT !== "pull_request") return t.pass();

    const [newFiles, currentFiles] = await Promise.all([fs.readdir(domainsPath), fs.readdir(headDomainsPath)]);

    const newDomainFiles = newFiles.filter((file) => !currentFiles.includes(file));

    const checks = newDomainFiles.map(async (file) => {
        const domain = await getJSONContent(domainsPath, file);

        if (!domain) return t.fail(`${file}: Unable to read domain data`);

        t.true(
            domain.owner.username.toLowerCase() === PR_AUTHOR || admins.includes(PR_AUTHOR),
            `${file}: Domain owner is ${domain.owner.username.toLowerCase()} but ${PR_AUTHOR} is the PR author`
        );
    });

    await Promise.all(checks);
    t.pass();
});
