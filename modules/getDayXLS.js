const readXlsxFile = require("read-excel-file/node");
function main(cfg) {
  return new Promise(async (resolve) => {
    var days = [
      "понеділок",
      "вівторок",
      "середу",
      "четвер",
      "п'ятницю",
      "суботу",
      "неділю",
    ];
    var day = "";
    try {
      var table = await readXlsxFile(cfg.path.xls);
      for (let i = 0; i < table.length; i++) {
        for (let j = 0; j < table[i].length; j++) {
          for (let k = 0; k < days.length; k++) {
            if (
              typeof table[i][j] == "string" &&
              table[i][j].includes(days[k])
            ) {
              day = days[k];
              break;
            }
          }
        }
      }
      resolve(day);
    } catch (err) {
      console.log(`[Parce day] не вдалось визначити день в таблиці`);
      resolve("");
    }
  });
}

module.exports = main;
