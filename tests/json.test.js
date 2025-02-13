const t = require("ava");
const fs = require("fs-extra");
const path = require("path");

const ignoredRootJSONFiles = ["package-lock.json", "package.json"];

const requiredFields = {
    owner: "object",
    record: "object",
};

const optionalFields = {
    proxied: "boolean",
    redirect_config: "object",
};

const requiredOwnerFields = {
    username: "string",
};

const optionalOwnerFields = {
    email: "string",
};

const optionalRedirectConfigFields = {
    custom_paths: "object",
    redirect_paths: "boolean",
};

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const hostnameRegex =
    /^(?=.{1,253}$)(?:(?:[_a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)\.)+[a-zA-Z]{2,63}$/;

const exceptedDomains = require("../util/excepted.json");
const reservedDomains = require("../util/reserved.json");
const domainsPath = path.resolve("domains");
const files = fs.readdirSync(domainsPath);

function expandReservedDomains(reserved) {
    const expandedList = [...reserved];

    reserved.forEach((item) => {
        const rangeMatch = item.match(/\[(\d+)-(\d+)\]/);

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
                throw new Error(
                    `[util/reserved.json] Invalid range [${start}-${end}] in "${item}"`,
                );
            }
        }
    });

    return expandedList;
}

const expandedReservedDomains = expandReservedDomains(reservedDomains);

function findDuplicateKeys(jsonString) {
    const keyPattern = /"([^"]+)"(?=\s*:)/g;
    const keys = [];
    let match;

    // Find all keys in the JSON string
    while ((match = keyPattern.exec(jsonString)) !== null) {
        keys.push(match[1]);
    }

    // Count occurrences of each key
    const keyCount = {};
    keys.forEach((key) => {
        keyCount[key] = (keyCount[key] || 0) + 1;
    });

    // Return keys that occur more than once
    return Object.keys(keyCount).filter((key) => keyCount[key] > 1);
}

function validateFields(t, obj, fields, file, prefix = "") {
    Object.keys(fields).forEach((key) => {
        const fieldPath = prefix ? `${prefix}.${key}` : key;

        if (obj.hasOwnProperty(key)) {
            t.is(
                typeof obj[key],
                fields[key],
                `${file}: Field ${fieldPath} should be of type ${fields[key]}`,
            );
        } else if (fields === requiredFields) {
            t.true(false, `${file}: Missing required field: ${fieldPath}`);
        }
    });
}

function validateFileName(t, file) {
    t.true(
        file.endsWith(".json"),
        `${file}: File does not have .json extension`,
    );
    t.false(
        file.includes(".is-a.dev"),
        `${file}: File name should not contain .is-a.dev`,
    );
    t.true(
        file === file.toLowerCase(),
        `${file}: File name should be all lowercase`,
    );

    // Ignore root domain
    if (file !== "@.json") {
        const subdomain = file.replace(/\.json$/, "");

        t.regex(
            subdomain + ".is-a.dev",
            hostnameRegex,
            `${file}: FQDN must be 1-253 characters, use letters, numbers, dots, or hyphens, and not start or end with a hyphen.`,
        );
        t.false(
            expandedReservedDomains.includes(subdomain),
            `${file}: Subdomain name is reserved`,
        );
        // Disallow nested subdomains above reserved domains
        t.true(
            !expandedReservedDomains.some((reserved) =>
                subdomain.endsWith(`.${reserved}`),
            ),
            `${file}: Subdomain name is reserved`,
        );

        const rootSubdomain = subdomain.split(".").pop();

        if (!exceptedDomains.includes(rootSubdomain)) {
            t.false(
                rootSubdomain.startsWith("_"),
                `${file}: Root subdomains should not start with an underscore`,
            );
        }
    }
}

t("JSON files should not be in the root directory", (t) => {
    const rootFiles = fs
        .readdirSync(path.resolve())
        .filter(
            (file) =>
                file.endsWith(".json") && !ignoredRootJSONFiles.includes(file),
        );
    t.is(rootFiles.length, 0, "JSON files should not be in the root directory");
});

t("All files should be valid JSON", (t) => {
    files.forEach((file) => {
        t.notThrows(
            () => fs.readJsonSync(path.join(domainsPath, file)),
            `${file}: Invalid JSON file`,
        );
    });
});

t("All files should not have duplicate keys", (t) => {
    files.forEach((file) => {
        // Parse JSON as a string because JS automatically gets the last key if there are duplicates
        const rawData = fs.readFileSync(`${domainsPath}/${file}`, "utf8");
        const duplicateKeys = findDuplicateKeys(rawData);

        t.true(
            !duplicateKeys.length,
            `${file}: Duplicate keys found: ${duplicateKeys.join(", ")}`,
        );
    });
});

t("All files should have valid file names", (t) => {
    files.forEach((file) => {
        validateFileName(t, file);
    });
});

t("All files should have valid required and optional fields", (t) => {
    files.forEach((file) => {
        const data = fs.readJsonSync(path.join(domainsPath, file));

        // Validate top-level required fields
        validateFields(t, data, requiredFields, file);

        // Validate owner fields
        validateFields(t, data.owner, requiredOwnerFields, file, "owner");
        validateFields(t, data.owner, optionalOwnerFields, file, "owner");

        // Validate optional fields for top-level and redirect config
        validateFields(t, data, optionalFields, file);
        if (data.redirect_config) {
            validateFields(
                t,
                data.redirect_config,
                optionalRedirectConfigFields,
                file,
                "redirect_config",
            );
        }

        // Validate email format
        if (data.owner.email) {
            t.regex(
                data.owner.email,
                emailRegex,
                `${file}: Owner email should be a valid email address`,
            );
            t.false(
                data.owner.email.endsWith("@users.noreply.github.com"),
                `${file}: Owner email should not be a GitHub no-reply email`,
            );
        }

        // Ensure 'record' field is not empty
        t.true(
            Object.keys(data.record).length > 0,
            `${file}: Missing DNS records`,
        );
    });
});

t("Reserved domains file should be valid", (t) => {
    const subdomainRegex = /^_?[a-zA-Z0-9]+([-\.][a-zA-Z0-9]+)*(\[\d+-\d+\])?$/;

    expandedReservedDomains.forEach((item, index) => {
        t.regex(
            item,
            subdomainRegex,
            `[util/reserved-domains.json] Invalid subdomain name "${item}" at index ${index}`,
        );
    });

    t.pass();
});
