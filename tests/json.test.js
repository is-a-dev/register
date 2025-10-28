const t = require("ava");
const fs = require("fs-extra");
const path = require("path");

const ignoredRootJSONFiles = ["package-lock.json", "package.json"];

const requiredFields = {
    owner: "object",
    records: "object"
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

const blockedFields = ["domain", "internal", "proxy", "reserved", "services", "subdomain"];

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const hostnameRegex = /^(?=.{1,253}$)(?:(?:[_a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)\.)+[a-zA-Z]{2,63}$/;

const internalDomains = require("../util/internal.json");
const reservedDomains = require("../util/reserved.json");

const domainsPath = path.resolve("domains");
const files = fs.readdirSync(domainsPath);

function findDuplicateKeys(jsonString) {
    const duplicateKeys = new Set();
    const keyStack = [];

    const keyRegex = /"(.*?)"\s*:/g;

    let i = 0;
    while (i < jsonString.length) {
        const char = jsonString[i];

        if (char === "{") {
            keyStack.push({});
            i++;
            continue;
        }

        if (char === "}") {
            keyStack.pop();
            i++;
            continue;
        }

        keyRegex.lastIndex = i;
        const match = keyRegex.exec(jsonString);
        if (match && match.index === i && keyStack.length > 0) {
            const key = match[1];
            const currentScope = keyStack[keyStack.length - 1];

            if (currentScope[key]) {
                duplicateKeys.add(key);
            } else {
                currentScope[key] = true;
            }

            i = keyRegex.lastIndex;
        } else {
            i++;
        }
    }

    return [...duplicateKeys];
}

async function validateFields(t, obj, fields, file, prefix = "") {
    for (const key of Object.keys(fields)) {
        const fieldPath = prefix ? `${prefix}.${key}` : key;

        if (obj.hasOwnProperty(key)) {
            t.is(typeof obj[key], fields[key], `${file}: Field ${fieldPath} should be of type ${fields[key]}`);
        } else if (fields === requiredFields || fields === requiredOwnerFields) {
            t.true(false, `${file}: Missing required field: ${fieldPath}`);
        }
    }
}

async function validateFileName(t, file) {
    t.true(file.endsWith(".json"), `${file}: File does not have .json extension`);
    t.false(file.includes(".is-a.dev"), `${file}: File name should not contain .is-a.dev`);
    t.true(file === file.toLowerCase(), `${file}: File name should be all lowercase`);
    t.false(file.includes("--"), `${file}: File name should not contain consecutive hyphens`);

    const subdomain = file.replace(/\.json$/, "");

    t.regex(
        subdomain + ".is-a.dev",
        hostnameRegex,
        `${file}: FQDN must be 1-253 characters, can use letters, numbers, dots, and non-consecutive hyphens.`
    );
    t.false(internalDomains.includes(subdomain), `${file}: Subdomain name is registered internally`);
    t.false(reservedDomains.includes(subdomain), `${file}: Subdomain name is reserved`);
    t.true(
        !internalDomains.some((i) => subdomain.endsWith(`.${i}`)),
        `${file}: Subdomain name is registered internally`
    );
    t.true(!reservedDomains.some((r) => subdomain.endsWith(`.${r}`)), `${file}: Subdomain name is reserved`);

    const rootSubdomain = subdomain.split(".").pop();
    t.false(rootSubdomain.startsWith("_"), `${file}: Root subdomains should not start with an underscore`);
}

async function processFile(file, t) {
    const filePath = path.join(domainsPath, file);
    const data = await fs.readJson(filePath);

    validateFileName(t, file);

    // Check for duplicate keys
    const rawData = await fs.readFile(filePath, "utf8");
    const duplicateKeys = findDuplicateKeys(rawData);
    t.true(!duplicateKeys.length, `${file}: Duplicate keys found: ${duplicateKeys.join(", ")}`);

    // Validate fields
    validateFields(t, data, requiredFields, file);
    validateFields(t, data.owner, requiredOwnerFields, file, "owner");
    validateFields(t, data.owner, optionalOwnerFields, file, "owner");
    validateFields(t, data, optionalFields, file);

    if (data.owner.email) {
        t.regex(data.owner.email, emailRegex, `${file}: Owner email should be a valid email address`);
        t.false(
            data.owner.email.endsWith("@users.noreply.github.com"),
            `${file}: Owner email should not be a GitHub no-reply email`
        );
    }

    t.true(Object.keys(data.records).length > 0, `${file}: Missing DNS records`);

    if (data.redirect_config) {
        validateFields(t, data.redirect_config, optionalRedirectConfigFields, file, "redirect_config");
    }

    for (const field of blockedFields) {
        t.true(!data.hasOwnProperty(field), `${file}: Disallowed field: ${field}`);
    }
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
