const request = require("request");
const progress = require("request-progress");
const fs = require("fs");

const cfg = JSON.parse(fs.readFileSync("./config/main.json", "utf8"));

async function r() {
  return new Promise((resolve, reject) => {
    progress(request(cfg.url), {})
      .on("error", (err) => {
        reject(new Error(`[Download ERROR] Помилка завантаження файлу`, err))
      })
      .on("end", () => {
        console.log(`[Download] Файл заавантажено успішно`);
        resolve();
      })
      .pipe(fs.createWriteStream(cfg.pdfpatch));
  });
}

module.exports = r;
