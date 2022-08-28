const readXlsxFile = require("read-excel-file/node");

async function main(db, cfg) {
  return new Promise(async (resolve, reject) => {
    try {
      var table = await readXlsxFile(cfg.path.xls);
      var output = [];
      for (var i = 0; i < table.length; i++) {
        var temp = [];
        if (typeof table[i][0] == "string" && table[i][0].includes("-")) {
          for (let j = 0; j < 16; j++) {
            var s = "";
            if (table[i][j] && table[i][j] != null)
              s = table[i][j].replace(/\s+/g, " ").trim();
            temp.push(s);
          }
          output.push(temp);
        }
      }
      await db.query(
        `
        TRUNCATE table timetable_xls_old;
        INSERT INTO timetable_xls_old SELECT * FROM  timetable_xls;
        TRUNCATE table timetable_xls;
        INSERT timetable_xls VALUES ?`,
        [output]
      );
      console.log(`[Parce XLS] Парсинг успішний.`);
      resolve(output);
    } catch (err) {
      console.log(err);
      reject(new Error(`[Parce XLS] Помилка  під час парсингу`, err));
    }
  });
}

module.exports = main;
