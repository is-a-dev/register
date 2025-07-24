const fs = require("fs");
const path = require("path");

const directoryPath = path.join(__dirname, "../domains");
const outputDir = path.join(__dirname, "../raw-api");

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

const internal = require(path.join(__dirname, "internal.json"));
const reserved = require(path.join(__dirname, "reserved.json"));

const v1 = [];
const v2 = [];

for (const subdomain of internal) {
    const commonData = {
        domain: `${subdomain}.is-a.dev`,
        subdomain: subdomain,
        owner: {
            username: "is-a-dev"
        }
    };

    const records = {
        CNAME: "internal.is-a.dev"
    };

    v1.push({
        ...commonData,
        record: records
    });

    v2.push({
        ...commonData,
        records: records,
        internal: true
    });
}

for (const subdomain of reserved) {
    const commonData = {
        domain: `${subdomain}.is-a.dev`,
        subdomain: subdomain,
        owner: {
            username: "is-a-dev"
        }
    };

    const records = {
        URL: "https://is-a.dev/reserved"
    };

    v1.push({
        ...commonData,
        record: records
    });

    v2.push({
        ...commonData,
        records: records,
        reserved: true
    });
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

            item.domain = name + ".is-a.dev";
            item.subdomain = name;

            delete item.owner.email;

            let itemV1 = {
                domain: item.domain,
                subdomain: item.subdomain,
                owner: item.owner,
                record: item.records
            };

            let itemV2 = {
                domain: item.domain,
                subdomain: item.subdomain,
                owner: item.owner,
                records: item.records
            };

            if (item.redirect_config) {
                itemV1.redirect_config = item.redirect_config;
                itemV2.redirect_config = item.redirect_config;
            }

            if (item.proxied) {
                itemV1.proxied = item.proxied;
                itemV2.proxied = item.proxied;
            }

            v1.push(itemV1);
            v2.push(itemV2);

            processedCount++;
            if (processedCount === files.length) {
                v1.sort((a, b) => a.domain.localeCompare(b.subdomain));
                v2.sort((a, b) => a.domain.localeCompare(b.subdomain));

                fs.writeFile("raw-api/index.json", JSON.stringify(v1), (err) => {
                    if (err) throw err;
                });

                fs.writeFile("raw-api/v1.json", JSON.stringify(v1), (err) => {
                    if (err) throw err;
                });

                fs.writeFile("raw-api/v2.json", JSON.stringify(v2), (err) => {
                    if (err) throw err;
                });
            }
        });
    });
});
