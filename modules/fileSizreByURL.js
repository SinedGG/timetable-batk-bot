const request = require("request");
function main(url) {
  return new Promise((resolve, reject) => {
    request(
      {
        url: url,
        method: "HEAD",
        time: true,
      },
      (err, response) => {
        if (err || !response || isNaN(response.headers["content-length"])) {
          reject(
            new Error(`[Request ERROR] Неможливо отримати розмір файлу з URL!`)
          );
        } else {
          var file_size = response.headers["content-length"];
          resolve({ size: file_size, time: response.elapsedTime });
        }
      }
    );
  });
}
module.exports = main;
