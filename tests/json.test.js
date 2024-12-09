const t = require("ava");
const fs = require("fs-extra");
const path = require("path");

const requiredFields = {
    owner: "object",
    record: "object"
};

const optionalFields = {
    proxied: "boolean",
    reserved: "boolean"
};

const requiredOwnerFields = {
    username: "string"
};

const optionalOwnerFields = {
    email: "string"
};

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const hostnameRegex = /^(?=.{1,253}$)(?:(?:[_a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)\.)+[a-zA-Z]{2,63}$/;

const domainsPath = path.resolve("domains");
const files = fs.readdirSync(domainsPath);

function validateRequiredFields(t, obj, requiredFields, file) {
    Object.keys(requiredFields).forEach((key) => {
        t.true(obj.hasOwnProperty(key), `${file}: Missing required field: ${key}`);
        t.is(typeof obj[key], requiredFields[key], `${file}: Field ${key} should be of type ${requiredFields[key]}`);
    });
}

function validateOptionalFields(t, obj, optionalFields, file) {
    Object.keys(optionalFields).forEach((key) => {
        if (obj.hasOwnProperty(key)) {
            t.is(
                typeof obj[key],
                optionalFields[key],
                `${file}: Field ${key} should be of type ${optionalFields[key]}`
            );
        }
    });
}

t("All files should be valid JSON", (t) => {
    files.forEach((file) => {
        t.notThrows(() => fs.readJsonSync(path.join(domainsPath, file)), `${file}: Invalid JSON file`);
    });
});

t("All files should have valid file names", (t) => {
    files.forEach((file) => {
        t.true(file.endsWith(".json"), `${file}: File does not have .json extension`);
        t.false(file.includes(".is-a.dev"), `${file}: File name should not contain .is-a.dev`);
        t.true(file === file.toLowerCase(), `${file}: File name should be lowercase`);

        // Ignore root domain
        if (file !== "@.json") {
            const subdomain = file.replace(/\.json$/, "");
            t.regex(
                subdomain + ".is-a.dev",
                hostnameRegex,
                `${file}: FQDN must be 1-253 characters, use letters, numbers, dots, or hyphens, and not start or end with a hyphen.`
            );
        }
    });
});

t("All files should have the required fields", (t) => {
    files.forEach((file) => {
        const data = fs.readJsonSync(path.join(domainsPath, file));

        // Validate top-level required fields
        validateRequiredFields(t, data, requiredFields, file);

        // Validate owner object fields
        validateRequiredFields(t, data.owner, requiredOwnerFields, file);

        // Ensure 'record' field is not empty unless reserved
        if (!data.reserved) {
            t.true(Object.keys(data.record).length > 0, `${file}: No record types found`);
        }
    });
});

t("All files should have valid optional fields", (t) => {
    files.forEach((file) => {
        const data = fs.readJsonSync(path.join(domainsPath, file));

        // Validate optional fields at top level
        validateOptionalFields(t, data, optionalFields, file);

        // Validate optional fields for owner object
        validateOptionalFields(t, data.owner, optionalOwnerFields, file);

        // Email validation (if provided)
        if (data.owner.email) {
            t.regex(data.owner.email, emailRegex, `${file}: Owner email should be a valid email address`);
        }
    });
});

const ignoredJSONFiles = ["package-lock.json", "package.json"];

t("JSON files should not be in the root directory", (t) => {
    const rootFiles = fs
        .readdirSync(path.resolve())
        .filter((file) => file.endsWith(".json") && !ignoredJSONFiles.includes(file));
    t.is(rootFiles.length, 0, "JSON files should not be in the root directory");
});
