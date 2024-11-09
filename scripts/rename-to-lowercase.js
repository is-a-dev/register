const fs = require("fs");
const path = require("path");

const directoryPath = path.join(__dirname, "../domains");

function renameFilesToLowercase() {
    // Read the files in the 'domains' directory
    fs.readdir(directoryPath, (err, files) => {
        if (err) {
            console.error("Error reading directory:", err);
            return;
        }

        files.forEach((file) => {
            const oldPath = path.join(directoryPath, file);
            const newPath = path.join(directoryPath, file.toLowerCase());

            // Only rename if the file name is not already in lowercase
            if (oldPath !== newPath) {
                fs.rename(oldPath, newPath, (err) => {
                    if (err) {
                        console.error("Error renaming file:", err);
                    } else {
                        console.log(`Renamed: ${file} -> ${file.toLowerCase()}`);
                    }
                });
            }
        });
    });
}

renameFilesToLowercase();
