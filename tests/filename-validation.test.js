import t from "ava";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const exec = promisify(execFile);
const cli = path.resolve("node_modules/ava/entrypoints/cli.js");
const validator = path.resolve("tests/json.test.js");

t("Both filename-validation paths accept the challenge and reject invalid records", async (t) => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "register-filenames-"));
    t.teardown(() => fs.rm(root, { recursive: true, force: true }));
    await fs.mkdir(path.join(root, "domains"));
    const file = path.join(root, "domains", "_github-pages-challenge-placeholder-.placeholder.json");
    const owner = { username: "placeholder-" };
    const run = () => exec(process.execPath, [cli, validator, "--concurrency=1"], {
        cwd: root,
        timeout: 10000,
        env: { ...process.env, FORCE_COLOR: "0" }
    });

    await fs.writeFile(file, JSON.stringify({ owner, records: { TXT: "verification" } }));
    const accepted = await run();
    t.regex(accepted.stdout, /4 tests passed/);

    for (const records of [{ TXT: [] }, { A: ["192.0.2.1"] }, { TXT: "v", A: ["192.0.2.1"] }]) {
        await fs.writeFile(file, JSON.stringify({ owner, records }));
        const rejected = await t.throwsAsync(run);
        t.is(rejected.code, 1);
        const output = rejected.stdout + rejected.stderr;
        t.regex(output, /\[fail\]: All files should have valid file names/);
        t.regex(output, /\[fail\]: All files should have valid required and optional fields/);
        t.regex(output, /only in a TXT-only GitHub Pages verification record/);
    }
});
