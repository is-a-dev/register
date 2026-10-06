const hostnameRegex = /^(?=.{1,253}$)(?:(?:[_a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)\.)+[a-zA-Z]{2,63}$/;
const challengePrefix = "_github-pages-challenge-";

export function isValidRecordName(name, records) {
    if (hostnameRegex.test(name)) return true;

    const dot = name.indexOf(".");
    const label = name.slice(0, dot);
    if (
        dot < 0 ||
        !label.startsWith(challengePrefix) ||
        !label.endsWith("-") ||
        label.length <= challengePrefix.length + 1 ||
        !records ||
        Object.keys(records).length !== 1 ||
        !Object.hasOwn(records, "TXT") ||
        !(typeof records.TXT === "string" ||
            (Array.isArray(records.TXT) && records.TXT.length > 0 &&
                records.TXT.every((value) => typeof value === "string")))
    ) {
        return false;
    }

    // TXT owner names are not hostnames (RFC 2181 section 11). Check the legacy
    // GitHub username's final hyphen as an alphanumeric character of equal length,
    // preserving every other label and both DNS length limits. Never rewrite DNS.
    return hostnameRegex.test(label.slice(0, -1) + "0" + name.slice(dot));
}
