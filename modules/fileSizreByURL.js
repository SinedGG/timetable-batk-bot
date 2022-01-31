const request = require("request");
const fs = require("fs");
const { rejects } = require("assert");

const cfg = JSON.parse(fs.readFileSync("./config/main.json", "utf8"));

function r() {
  return new Promise((resolve, reject) => {
    request(
      {
        url: cfg.url,
        method: "HEAD",
      },
      (err, response) => {
        if (err || isNaN(response.headers["content-length"])|| !response) {
          reject(
            new Error(`[Request ERROR] Неможливо отримати розмір файлу!`, err)
          );
        } else {
          resolve(response.headers["content-length"]);
        }
      }
    );
  });
}
module.exports = r;
