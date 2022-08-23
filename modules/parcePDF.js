const pdf_table_extractor = require("pdf-table-extractor");

function main(db, cfg) {
  return new Promise((resolve, reject) => {
    pdf_table_extractor(cfg.pdfpatch, success, error);
    console.log(`[Parce PDF] Початок парсингу файлу.`);

    async function success(result) {
      var table = result.pageTables[0].tables;
      var output = [];
      for (var i = 0; i < table.length; i++) {
        var temp = [];
        if (table[i][0] != "" && table[i][0] != "Група") {
          for (let j = 0; j < 11; j++) {
            var s = "";
            if (table[i][j]) s = table[i][j].replace(/\s+/g, "").trim();
            temp.push(s);
          }
          output.push(temp);
        }
      }
      await db
        .query(
          `TRUNCATE table timetable_old;
        INSERT INTO timetable_old SELECT * FROM  timetable;
        TRUNCATE table timetable;
        INSERT timetable VALUES ?`,
          [output]
        )
        .catch((err) => {
          reject(new Error(`[DB ERROR] Помилка даних під час парсингу`, err));
          console.log(err);
        });
      console.log(`[Parce PDF] Парсинг успішний.`);
      resolve(output);
    }

    function error(err) {
      reject(new Error(`[Parce ERROR] Помилка парсингу pdf файлу`, err));
    }
  });
}

module.exports = main;
