const fs = require('fs');
const path = require('path');

const domainsDir = path.join(__dirname, 'domains');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach((file) => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath, callback);
    } else {
      callback(fullPath);
    }
  });
}

function removeOwlField(filePath) {
  if (path.extname(filePath).toLowerCase() !== '.json') return;

  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (data.owner && typeof data.owner === 'object') {
      // Find the key that matches OWL, case-insensitive
      for (const key of Object.keys(data.owner)) {
        if (key.toLowerCase() === 'owl') {
          delete data.owner[key];
          fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
          console.log(`Removed owner.${key} from: ${filePath}`);
          break;
        }
      }
    }
  } catch (err) {
    console.error(`Failed to process ${filePath}: ${err.message}`);
  }
}

walkDir(domainsDir, removeOwlField);
