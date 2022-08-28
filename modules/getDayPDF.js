const pdf = require("pdf-parse");
const fs = require("fs");

async function main(cfg) {
  return new Promise((resolve) => {
    var days = [
      "понеділок",
      "вівторок",
      "середу",
      "четвер",
      "п'ятницю",
      "суботу",
      "неділю",
    ];
    var day;
    let file = fs.readFileSync(cfg.path.pdf);

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
        console.log(`[Get day] Отримання дня тижня успішне. День - ${day}`);
        resolve(day);
      }
    });
  });
}
module.exports = main;
