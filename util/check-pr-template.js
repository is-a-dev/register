const body = process.env.PR_BODY || "";

const REQUIRED_CHECKBOXES = [
    "TOS",
    "DOMAIN_STRUCTURE",
    "WEBSITE_REACHABLE",
    "SOFTWARE_RELATED",
    "NON_COMMERCIAL",
    "CONTACT_INFO",
    "WEBSITE_LINK",
];

function isCheckboxChecked(marker) {
    const regex = new RegExp(
        `-\\s*\\[[xX]\\]\\s*<!--\\s*${marker}\\s*-->`,
        "i",
    );

    return regex.test(body);
}

function getSection(startMarker, endMarker) {
    const regex = new RegExp(
        `${escapeRegExp(startMarker)}([\\s\\S]*?)${escapeRegExp(endMarker)}`,
        "i",
    );

    const match = body.match(regex);

    return match ? match[1].trim() : "";
}

function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const errors = [];

for (const checkbox of REQUIRED_CHECKBOXES) {
    if (!isCheckboxChecked(checkbox)) {
        errors.push(
            `The \`${checkbox}\` requirement has not been checked.`,
        );
    }
}

const websitePreview = getSection(
    "<!-- WEBSITE_PREVIEW_START -->",
    "<!-- WEBSITE_PREVIEW_END -->",
);

if (!websitePreview) {
    errors.push(
        "The **Website Preview** section has not been filled out.",
    );
}

const websitePurpose = getSection(
    "<!-- WEBSITE_PURPOSE_START -->",
    "<!-- WEBSITE_PURPOSE_END -->",
);

if (!websitePurpose) {
    errors.push(
        "The **Website Purpose** section has not been filled out.",
    );
}

if (errors.length > 0) {
    console.error("PR template validation failed.");
    console.error("");
    console.error(errors.join("\n"));

    process.exit(1);
}

console.log("PR template validation passed.");
