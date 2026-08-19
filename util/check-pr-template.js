const body = process.env.PR_BODY || "";

const REQUIRED_CHECKBOXES = [
    "I agree to the [Terms of Service]",
    "My file is following the [domain structure]",
    "My website is reachable and completed.",
    "My website is software development related.",
    "My website is not for commercial use.",
    "I have provided sufficient contact information in the `owner` key.",
    "I have provided a link to my website below.",
];

function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function isRequiredCheckboxChecked(text) {
    const regex = new RegExp(
        `-\\s*\\[[xX]\\]\\s*(?:<!--[^>]*-->\\s*)?${escapeRegExp(text)}`,
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

const errors = [];

const uncheckedRequirements = REQUIRED_CHECKBOXES.filter(
    (requirement) => !isRequiredCheckboxChecked(requirement),
);

if (uncheckedRequirements.length > 0) {
    errors.push(
        "The following required checkboxes have not been checked:",
        ...uncheckedRequirements.map((requirement) => `- ${requirement}`),
    );
}

if (
    !getSection(
        "<!-- WEBSITE_PREVIEW_START -->",
        "<!-- WEBSITE_PREVIEW_END -->",
    )
) {
    errors.push("The **Website Preview** section has not been filled out.");
}

if (
    !getSection(
        "<!-- WEBSITE_PURPOSE_START -->",
        "<!-- WEBSITE_PURPOSE_END -->",
    )
) {
    errors.push("The **Website Purpose** section has not been filled out.");
}

if (errors.length > 0) {
    console.error("PR template validation failed.");
    console.error("");
    console.error(errors.join("\n"));
    process.exit(1);
}

console.log("PR template validation passed.");
