const request = require("request");
const fs = require("fs");

async function main(url, patch) {
  return new Promise((resolve, reject) => {
    var file = fs.createWriteStream(patch);
    request(
      {
        url: url,
        time: true,
      },
      (err, res) => {
        console.log(`[Download] Request time - ${res.elapsedTime} ms`);
      }
    )
      .pipe(file)
      .on("finish", (err, response) => {
        console.log(`[Download] Файл заавантажено успішно.`);
        resolve();
      })
      .on("error", (error) => {
        reject(new Error(`[Download ERROR] Помилка завантаження файлу`));
      });
  });
}

module.exports = main;
