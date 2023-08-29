module.exports = () => {
  const axios = require("axios");
  return new Promise(async (resolve, reject) => {
    try {
      const startTime = new Date();
      const res = await axios.get(process.env.TIMETABLE_URL);
      const fileSize = res.headers["content-length"];
      const endTime = new Date();

      const elapsedTime = endTime - startTime;
      resolve({
        value: fileSize,
        elapsedTime,
      });
    } catch (e) {
      reject(e);
    }
  });
};
