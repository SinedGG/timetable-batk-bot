
const pdf = require("pdf-parse");
const fs = require("fs");
const cfg = JSON.parse(fs.readFileSync("./config/main.json", "utf8"));

async function r(db) {
  return new Promise((resolve) => {
    var days = [
      "понеділок",
      "вівторок",
      "середу",
      "четвер",
      "п'ятницю",
      "суботу",
    ];
    var day;
    let file = fs.readFileSync(cfg.pdfpatch);

    pdf(file).then((data) => {
      for (let index = 0; index < days.length; index++) {
        if (data.text.indexOf(days[index]) != -1) {
          day = days[index];
          break;
        }
      }
      if (day == undefined) {
        console.log(`[Parce day] не вдалось визначити день в таблиці`);
        resolve("");
      } else {
        console.log(`[Get day] Отримання дня тижня успішне. День - ${day}`)
        resolve(day);
      }
    });
  });
}

// sendTimetable({ course: "table" }, "");

module.exports = r;
