const fs = require("fs");
const path = require("path");

const directoryPath = path.join(__dirname, "../domains");
const outputDir = path.join(__dirname, "../raw-api");
const domainsOutputDir = path.join(outputDir, "v2", "domains");

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}
if (!fs.existsSync(domainsOutputDir)) {
    fs.mkdirSync(domainsOutputDir, { recursive: true });
}

const internal = require(path.join(__dirname, "internal.json"));
const reserved = require(path.join(__dirname, "reserved.json"));
const v2 = [];

function writeDomainFile(entry) {
    fs.writeFileSync(
        path.join(domainsOutputDir, `${entry.subdomain}.json`),
        JSON.stringify(entry)
    );
}

for (const subdomain of internal) {
    const entry = {
        domain: `${subdomain}.is-a.dev`,
        subdomain: subdomain,
        owner: { username: "is-a-dev" },
        records: { CNAME: "internal.is-a.dev" },
        internal: true
    };
    v2.push(entry);
    writeDomainFile(entry);
}

for (const subdomain of reserved) {
    const entry = {
        domain: `${subdomain}.is-a.dev`,
        subdomain: subdomain,
        owner: { username: "is-a-dev" },
        records: { URL: "https://is-a.dev/reserved" },
        reserved: true
    };
    v2.push(entry);
    writeDomainFile(entry);
}

fs.readdir(directoryPath, function (err, files) {
    if (err) throw err;

    let processedCount = 0;

    files.forEach(function (file) {
        const filePath = path.join(directoryPath, file);

        fs.readFile(filePath, "utf8", (err, data) => {
            if (err) throw err;

            const item = JSON.parse(data);
            const name = path.parse(file).name;

            item.domain = `${name}.is-a.dev`;
            item.subdomain = name;
            delete item.owner.email;

            const itemV2 = {
                domain: item.domain,
                subdomain: item.subdomain,
                owner: item.owner,
                records: item.records
            };
            if (item.redirect_config) itemV2.redirect_config = item.redirect_config;
            if (item.proxied) itemV2.proxied = item.proxied;

            v2.push(itemV2);
            writeDomainFile(itemV2);

            processedCount++;
            if (processedCount === files.length) {
                v2.sort((a, b) => a.domain.localeCompare(b.subdomain));
                fs.writeFile(
                    path.join(outputDir, "v2.json"),
                    JSON.stringify(v2),
                    (err) => { if (err) throw err; }
                );
            }
        });
    });
});
