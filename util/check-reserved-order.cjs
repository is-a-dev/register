const { readFileSync } = require("node:fs");
const { join } = require("node:path");

const filePath = join(__dirname, "reserved.json");
const fileContents = readFileSync(filePath, "utf8");
const reserved = JSON.parse(fileContents);

for (let index = 1; index < reserved.length; index += 1) {
  if (reserved[index - 1] > reserved[index]) {
    let precedingIndex = index - 1;

    while (
      precedingIndex >= 0 &&
      reserved[precedingIndex] > reserved[index]
    ) {
      precedingIndex -= 1;
    }

    const precedingLine = precedingIndex + 2;

    console.error(
      `reserved.json is not in alphabetical order: line ${index + 2} ("${reserved[index]}") should go after line ${precedingLine} ("${precedingIndex >= 0 ? reserved[precedingIndex] : "["}") and before line ${index + 1} ("${reserved[index - 1]}").`,
    );
    process.exitCode = 1;
    break;
  }
}

if (process.exitCode !== 1) {
  console.log("reserved.json is in alphabetical order.");
}