const tools = require("./orgis.js");
const fs = require("fs");
require("dotenv").config();

const testFolder = process.env.SOURCE_FOLDER;
const destinationFolder = process.env.DESTINATION_FOLDER;
var logStream = fs.createWriteStream(process.env.LOG_FILE, { flags: "a" });

// Ensure destination folder exists
if (!fs.existsSync(destinationFolder)) {
  fs.mkdirSync(destinationFolder, { recursive: true });
}

fs.readdir(testFolder, (err, files) => {
  if (err) throw err;
  let i = 0;
  files.forEach((file) => {
    i++;
    process.stdout.write(`\rSearching for .ogg files: ${i} ${file}`);
    if (file.includes(".ogg")) {
      console.log(" -> " + file);
      let filePath = testFolder + file;

      tools.getSpeechExtractor(filePath)
        .then((result) => {
          // Create a result message to log (if you still want a combined log)
          let message = `
=====================================
File: ${file}
Datetime: ${new Date().toLocaleString(process.env.LANGUAGE)}
-------------------------------------
${result}
=====================================
`;
          console.log(message);
          logStream.write(message);

          // Write the extracted result to a separate file.
          // Here we use the same filename but replace .ogg with .txt.
          const resultFileName = file.replace(/\.ogg$/i, ".txt");
          const resultFilePath = destinationFolder + resultFileName;

          fs.writeFile(resultFilePath, result, (err) => {
            if (err) {
              console.error(`Error writing result file for ${file}:`, err);
            } else {
              console.log(`Transcription written to -> ${resultFilePath}`);
            }
          });
        })
        .then(() => {
          // Move the processed .ogg file to the destination folder.
          const newPath = destinationFolder + file;
          fs.rename(filePath, newPath, (err) => {
            if (err) {
              console.error(`Error moving file ${file}:`, err);
            } else {
              console.log("File moved to -> " + newPath);
            }
          });
        })
        .catch((error) => {
          console.error(`Error processing file ${file}:`, error);
        });
    }
  });
});
