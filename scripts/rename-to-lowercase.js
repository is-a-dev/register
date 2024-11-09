const fs = require("fs");
const path = require("path");

const directoryPath = path.join(__dirname, "../domains");

(async () => {
    // Read the files in the 'domains' directory
    fs.readdirSync(directoryPath, (err, files) => {
        if (err) {
            console.error("Error reading directory:", err);
            return;
        }

        files.forEach(async (file) => {
            const oldPath = path.join(directoryPath, file);
            const newPath = path.join(directoryPath, file.toLowerCase());

            // Only rename if the file name is not already in lowercase
            if (oldPath !== newPath) {
                fs.renameSync(oldPath, newPath, (err) => {
                    if (err) {
                        console.error("Error renaming file:", err);
                    } else {
                        console.log(`Renamed: ${file} -> ${file.toLowerCase()}`);
                    }
                });
            }
        });
    });
})();
