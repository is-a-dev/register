const t = require("ava");
const fs = require("fs-extra");
const path = require("path");
const { promisify } = require("util");

const ignoredRootJSONFiles = ["package-lock.json", "package.json"];

const requiredFields = {
    owner: "object",
    record: "object"
};

const optionalFields = {
    proxied: "boolean",
    redirect_config: "object"
};

const requiredOwnerFields = {
    username: "string"
};

const optionalOwnerFields = {
    email: "string"
};

const optionalRedirectConfigFields = {
    custom_paths: "object",
    redirect_paths: "boolean"
};

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const hostnameRegex = /^(?=.{1,253}$)(?:(?:[_a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)\.)+[a-zA-Z]{2,63}$/;

const exceptedDomains = require("../util/excepted.json");
const reservedDomains = require("../util/reserved.json");
const domainsPath = path.resolve("domains");
const files = fs.readdirSync(domainsPath);

function findDuplicateKeys(jsonString) {
    const keyPattern = /"([^"]+)"(?=\s*:)/g;
    const keys = [];
    let match;

    while ((match = keyPattern.exec(jsonString)) !== null) {
        keys.push(match[1]);
    }

    const keyCount = {};
    keys.forEach((key) => {
        keyCount[key] = (keyCount[key] || 0) + 1;
    });

    return Object.keys(keyCount).filter((key) => keyCount[key] > 1);
}

async function validateFields(t, obj, fields, file, prefix = "") {
    for (const key of Object.keys(fields)) {
        const fieldPath = prefix ? `${prefix}.${key}` : key;

        if (obj.hasOwnProperty(key)) {
            t.is(typeof obj[key], fields[key], `${file}: Field ${fieldPath} should be of type ${fields[key]}`);
        } else if (fields === requiredFields) {
            t.true(false, `${file}: Missing required field: ${fieldPath}`);
        }
    }
}

async function validateFileName(t, file) {
    t.true(file.endsWith(".json"), `${file}: File does not have .json extension`);
    t.false(file.includes(".is-a.dev"), `${file}: File name should not contain .is-a.dev`);
    t.true(file === file.toLowerCase(), `${file}: File name should be all lowercase`);

    if (file !== "@.json") {
        const subdomain = file.replace(/\.json$/, "");

        t.regex(
            subdomain + ".is-a.dev",
            hostnameRegex,
            `${file}: FQDN must be 1-253 characters, use letters, numbers, dots, or hyphens, and not start or end with a hyphen.`
        );
        t.false(reservedDomains.includes(subdomain), `${file}: Subdomain name is reserved`);
        t.true(
            !reservedDomains.some((reserved) => subdomain.endsWith(`.${reserved}`)),
            `${file}: Subdomain name is reserved`
        );

        const rootSubdomain = subdomain.split(".").pop();

        if (!exceptedDomains.includes(rootSubdomain)) {
            t.false(rootSubdomain.startsWith("_"), `${file}: Root subdomains should not start with an underscore`);
        }
    }
}

async function processFile(file, t) {
    const filePath = path.join(domainsPath, file);
    const data = await fs.readJson(filePath);

    validateFileName(t, file);

    // Validate fields and duplicates
    validateFields(t, data, requiredFields, file);
    validateFields(t, data.owner, requiredOwnerFields, file, "owner");
    validateFields(t, data.owner, optionalOwnerFields, file, "owner");
    validateFields(t, data, optionalFields, file);

    if (data.redirect_config) {
        validateFields(t, data.redirect_config, optionalRedirectConfigFields, file, "redirect_config");
    }

    if (data.owner.email) {
        t.regex(data.owner.email, emailRegex, `${file}: Owner email should be a valid email address`);
        t.false(
            data.owner.email.endsWith("@users.noreply.github.com"),
            `${file}: Owner email should not be a GitHub no-reply email`
        );
    }

    t.true(Object.keys(data.record).length > 0, `${file}: Missing DNS records`);

    // Check for duplicate keys
    const rawData = await fs.readFile(filePath, "utf8");
    const duplicateKeys = findDuplicateKeys(rawData);
    t.true(!duplicateKeys.length, `${file}: Duplicate keys found: ${duplicateKeys.join(", ")}`);
}

t("JSON files should not be in the root directory", (t) => {
    const rootFiles = fs
        .readdirSync(path.resolve())
        .filter((file) => file.endsWith(".json") && !ignoredRootJSONFiles.includes(file));
    t.is(rootFiles.length, 0, "JSON files should not be in the root directory");
});

t("All files should be valid JSON", async (t) => {
    await Promise.all(
        files.map((file) => {
            return t.notThrows(() => fs.readJson(path.join(domainsPath, file)), `${file}: Invalid JSON file`);
        })
    );
});

t("All files should have valid file names", async (t) => {
    await Promise.all(files.map((file) => validateFileName(t, file)));
});

t("All files should have valid required and optional fields", async (t) => {
    await Promise.all(files.map((file) => processFile(file, t)));
});
