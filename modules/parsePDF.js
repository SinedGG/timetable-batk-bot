const PDFJS = require("pdfjs-dist/build/pdf.js");
const fs = require("fs");
const parse = require("./assemble_table.js");
function main(db, cfg) {
  return new Promise(async (resolve, reject) => {
    try {
      var file = fs.readFileSync(cfg.path.pdf);
      var data = new Uint8Array(file);
      var doc = await PDFJS.getDocument(data).promise;
    } catch (err) {
      console.log(err);
      reject(new Error(`[Parce ERROR] Помилка парсингу pdf файлу`, err));
    }

    var table = await parse(PDFJS, doc);
    var output = table.slice(2);

    await db
      .query(
        `
        TRUNCATE table timetable_xls_old;
        INSERT INTO timetable_xls_old SELECT * FROM  timetable_xls;
        TRUNCATE table timetable_xls;
        INSERT timetable_xls VALUES ?`,
        [output]
      )
      .catch((err) => {
        reject(new Error(`[DB ERROR] Помилка даних під час парсингу`, err));
        console.log(err);
      });
    console.log(`[Parce PDF] Парсинг успішний.`);
    resolve(output);
  });
}

module.exports = main;
