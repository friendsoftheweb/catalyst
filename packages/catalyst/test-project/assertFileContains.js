const fs = require('fs');
const path = require('path');

module.exports = async function assertFileContains({ file, content }) {
  return new Promise((resolve, reject) => {
    fs.readFile(path.resolve(__dirname, `./dist/${file}`), (error, data) => {
      if (error != null) {
        reject(error);
      } else {
        if (data.includes(content)) {
          resolve();
        } else {
          reject();
        }
      }
    });
  });
};
