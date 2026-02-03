const t = require("ava");
const fs = require("fs-extra");
const path = require("path");

const requiredEnvVars = ["PR_AUTHOR", "PR_AUTHOR_ID"];
const trustedUsers = require("../util/trusted.json");

const trusted = trustedUsers.map((u) => u.id.toString());
const admins = trustedUsers.filter((u) => u.admin).map((u) => u.id.toString());

function getDomainData(subdomain) {
    try {
        const data = fs.readJsonSync(path.join(path.resolve("domains"), `${subdomain}.json`));
        return data;
    } catch (error) {
        throw new Error(`Failed to read JSON for ${subdomain}: ${error.message}`);
    }
}

t("Users can only update their own subdomains", (t) => {
    if (requiredEnvVars.every((v) => process.env[v])) {
        const changedFiles = JSON.parse(process.env.CHANGED_FILES);
        const deletedFiles = JSON.parse(process.env.DELETED_FILES);
        const prAuthor = process.env.PR_AUTHOR.toLowerCase();
        const prAuthorId = process.env.PR_AUTHOR_ID;

        const changedJSONFiles = changedFiles
            .filter((file) => file.startsWith("domains/"))
            .map((file) => path.basename(file));
        const deletedJSONFiles = deletedFiles
            .filter((file) => file.name.startsWith("domains/"))
            .map((file) => path.basename(file.name));

        if (!changedJSONFiles && !deletedFiles) return t.pass();
        if (process.env.PR_LABELS && process.env.PR_LABELS.includes("ci: bypass-owner-check")) return t.pass();

        changedJSONFiles.forEach((file) => {
            const subdomain = file.replace(/\.json$/, "");
            const data = getDomainData(subdomain);

            if (data.owner.username === "is-a-dev") {
                t.true(
                    admins.includes(prAuthorId),
                    `${subdomain}: ${prAuthor} is not authorized to update ${subdomain}.is-a.dev`
                );
            } else {
                t.true(
                    data.owner.username.toLowerCase() === prAuthor || trusted.includes(prAuthorId),
                    `${file}: ${prAuthor} is not authorized to update ${subdomain}.is-a.dev`
                );
            }
        });

        deletedJSONFiles.forEach((file) => {
            const subdomain = file.replace(/\.json$/, "");
            const data = JSON.parse(
                deletedFiles
                    .find((f) => f.name === `domains/${file}`)
                    .data.split("\n")
                    .filter((line) => line.startsWith("-") && !line.startsWith("---"))
                    .map((line) => line.substring(1))
                    .join("\n")
            );

            if (data.owner.username === "is-a-dev") {
                t.true(
                    admins.includes(prAuthorId),
                    `${subdomain}: ${prAuthor} is not authorized to delete ${subdomain}.is-a.dev`
                );
            } else {
                t.true(
                    data.owner.username.toLowerCase() === prAuthor || trusted.includes(prAuthorId),
                    `${file}: ${prAuthor} is not authorized to delete ${subdomain}.is-a.dev`
                );
            }
        });
    }

    t.pass();
});
