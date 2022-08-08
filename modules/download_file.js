const cfg = require("../config.js"),
  fs = require("fs");
https = require("https");
function main() {
  return new Promise((resolve, reject) => {
    https
      .get(cfg.url, (res) => {
        const file = fs.createWriteStream(cfg.pdfpatch);
        res.pipe(file);
        file.on("finish", () => {
          file.close();
          console.log(`[Download] Файл заавантажено успішно`);
          resolve();
        });
      })
      .on("error", (err) => {
        reject(new Error(`[Download ERROR] Помилка завантаження файлу`));
      });
  });
}
module.exports = main;
