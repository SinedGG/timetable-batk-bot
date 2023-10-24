module.exports = () => {
  return new Promise(async (resolve, reject) => {
    const axios = require("axios");
    const fs = require("fs");

    try {
      const startTime = new Date();
      const res = await axios.get(process.env.TIMETABLE_URL, {
        responseType: "stream",
        timeout: 5000,
      });
      const writer = fs.createWriteStream("./temp/zm.pdf");
      res.data.pipe(writer);
      writer.on("finish", () => {
        const endTime = new Date();
        const elapsedTime = endTime - startTime;
        resolve({ elapsedTime });
      });
    } catch (e) {
      reject(new Error(`[Download] Unable to download file`));
    }
  });
};
