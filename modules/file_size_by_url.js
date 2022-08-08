const cfg = require("../config.js"),
  request = require("request");
function main() {
  return new Promise((resolve, reject) => {
    request(
      {
        url: cfg.url,
        method: "HEAD",
      },
      (err, response) => {
        if (err || !response || isNaN(response.headers["content-length"])) {
          reject(new Error(`[Request ERROR] Неможливо отримати розмір файлу!`));
        } else {
          resolve(response.headers["content-length"]);
        }
      }
    );
  });
}
module.exports = main;
