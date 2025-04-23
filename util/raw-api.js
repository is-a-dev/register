const fs = require("fs");
const path = require("path");

const directoryPath = path.join(__dirname, "../domains");
const reserved = require(path.join(__dirname, "reserved.json"));
const internal = require(path.join(__dirname, "internal.json"));
const outputDir = path.join(__dirname, "../raw-api");

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

let v1 = [];
let v2 = [];

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
        reserved: true,
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

            if (item.owner && item.owner.email) {
                delete item.owner.email;
            }

            const itemV1 = {
                ...item,
                record: item.records
            };
            delete itemV1.records;

            const itemV2 = {
                ...item,
                records: item.records
            };
            delete itemV2.record;

            v1.push(itemV1);
            v2.push(itemV2);

            processedCount++;
            if (processedCount === files.length) {
                fs.writeFile("raw-api/index.json", JSON.stringify(v1, null, 2), (err) => {
                    if (err) throw err;
                });

                fs.writeFile("raw-api/v1.json", JSON.stringify(v1, null, 2), (err) => {
                    if (err) throw err;
                });

                fs.writeFile("raw-api/v2.json", JSON.stringify(v2, null, 2), (err) => {
                    if (err) throw err;
                });
            }
        });
    });
});
