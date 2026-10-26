const { readFileSync, writeFileSync } = require("node:fs");
const { join } = require("node:path");
const readline = require("node:readline");

const filePath = join(__dirname, "reserved.json");
const prompt = "What subdomain would you want to add to the reserved.json list: ";

const interface = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

interface.question(prompt, (input) => {
  const subdomain = input.trim();

  if (!subdomain) {
    console.error("Subdomain cannot be empty.");
    interface.close();
    process.exitCode = 1;
    return;
  }

  if (subdomain !== subdomain.toLowerCase() || /\s/.test(subdomain)) {
    console.error("Subdomain must be lowercase and cannot contain whitespace.");
    interface.close();
    process.exitCode = 1;
    return;
  }

  const fileContents = readFileSync(filePath, "utf8");
  const reserved = JSON.parse(fileContents);

  if (reserved.includes(subdomain)) {
    console.error(`"${subdomain}" is already in reserved.json.`);
    interface.close();
    process.exitCode = 1;
    return;
  }

  const insertionIndex = reserved.findIndex(
    (entry) => entry > subdomain,
  );
  const index = insertionIndex === -1 ? reserved.length : insertionIndex;
  reserved.splice(index, 0, subdomain);

  const newline = fileContents.includes("\r\n") ? "\r\n" : "\n";
  const output = `${JSON.stringify(reserved, null, 4)}${newline}`;
  writeFileSync(filePath, output);

  const lineNumber = index + 2;
  const precedingEntry = index > 0 ? reserved[index - 1] : "[";
  const followingEntry = index < reserved.length - 1 ? reserved[index + 1] : "]";
  console.log(
    `Added "${subdomain}" on line ${lineNumber}, after "${precedingEntry}" and before "${followingEntry}".`,
  );
  interface.close();
});