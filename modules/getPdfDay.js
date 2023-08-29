module.exports = () => {
  const parse = require("pdf-parse");
  const fs = require("fs");

  return new Promise(async (resolve) => {
    const days = [
      "понеділок",
      "вівторок",
      "середу",
      "четвер",
      "п'ятницю",
      "суботу",
      "неділю",
    ];
    const file = fs.readFileSync("./temp/zm.pdf");

    const pdf = await parse(file);
    var day;
    for (let index = 0; index < days.length; index++) {
      if (pdf.text.indexOf(days[index]) != -1) {
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
};
