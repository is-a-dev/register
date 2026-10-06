import t from "ava";
import { isValidRecordName } from "../util/record-name.js";

const prefix = "_github-pages-challenge-";
const challenge = `${prefix}placeholder-.placeholder.is-a.dev`;
const txt = { TXT: "verification" };

t("Existing hostnames and challenge names keep their validation", (t) => {
    for (const name of ["placeholder.is-a.dev", `${prefix}placeholder.placeholder.is-a.dev`, "_other.placeholder.is-a.dev"]) {
        t.true(isValidRecordName(name, { A: ["192.0.2.1"] }), name);
    }
    for (const records of [txt, { TXT: ["verification"] }]) {
        t.true(isValidRecordName(challenge, records));
        t.true(isValidRecordName(`${prefix}a-.nested.placeholder.is-a.dev`, records));
    }
});

t("The trailing-hyphen exception is limited to the first GitHub challenge label and TXT only", (t) => {
    for (const records of [undefined, null, {}, { A: ["192.0.2.1"] }, { TXT: "v", A: ["192.0.2.1"] },
        { TXT: null }, { TXT: 42 }, { TXT: [] }, { TXT: ["v", 42] }]) {
        t.false(isValidRecordName(challenge, records), JSON.stringify(records));
    }
    for (const name of [
        "ordinary-.placeholder.is-a.dev",
        "_other-placeholder-.placeholder.is-a.dev",
        "_github-pages-challenger-placeholder-.placeholder.is-a.dev",
        `${prefix}placeholder!.placeholder.is-a.dev`,
        `${prefix}.placeholder.is-a.dev`,
        `${prefix}-.placeholder.is-a.dev`,
        `${prefix}placeholder-.bad-.is-a.dev`,
        `${prefix}placeholder-.-bad.is-a.dev`,
        `${prefix}placeholder-..is-a.dev`,
        `${prefix}placeholder-.bad_name.is-a.dev`,
        `nested.${challenge}`,
        `${prefix}placeholder-`
    ]) {
        t.false(isValidRecordName(name, txt), name);
    }
});

t("Challenge exceptions preserve label and full-name length limits", (t) => {
    const label = prefix + "a".repeat(63 - prefix.length - 1) + "-";
    t.true(isValidRecordName(`${label}.placeholder.is-a.dev`, txt));
    t.false(isValidRecordName(`${label}-.placeholder.is-a.dev`, txt));
    t.false(isValidRecordName(`${prefix}placeholder-.${"a".repeat(64)}.is-a.dev`, txt));

    const full = `${label}.${"b".repeat(63)}.${"c".repeat(63)}.${"d".repeat(52)}.is-a.dev`;
    t.is(full.length, 253);
    t.true(isValidRecordName(full, txt));
    t.false(isValidRecordName(full.replace(".is-a.dev", "d.is-a.dev"), txt));
});
