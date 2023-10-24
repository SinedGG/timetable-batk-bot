module.exports = () => {
  const axios = require("axios");
  return new Promise(async (resolve, reject) => {
    try {
      const startTime = new Date();
      const res = await axios.get(process.env.TIMETABLE_URL, {
        timeout: 5000,
      });
      const fileSize = res.headers["content-length"];
      const endTime = new Date();

      const elapsedTime = endTime - startTime;
      resolve({
        value: fileSize,
        elapsedTime,
      });
    } catch (e) {
      console.log(e.message);
      reject(new Error(`[Request ERROR] Unable to get file size from URL`));
    }
  });
};
