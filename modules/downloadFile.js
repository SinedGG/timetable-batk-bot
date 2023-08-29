module.exports = () => {
  return new Promise(async (resolve, reject) => {
    const axios = require("axios");
    const fs = require("fs");

    const startTime = new Date();
    const res = await axios.get(process.env.TIMETABLE_URL, {
      responseType: "stream",
    });
    const writer = fs.createWriteStream("./temp/zm.pdf");
    res.data.pipe(writer);
    writer.on("finish", () => {
      const endTime = new Date();
      const elapsedTime = endTime - startTime;
      resolve({ elapsedTime });
    });
  });
};
