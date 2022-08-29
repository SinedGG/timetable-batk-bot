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
    var output = [];
    for (var i = 0; i < table.length; i++) {
      var temp = [];
      var s = "";
      if (typeof table[i][0] == "string" && table[i][0].includes("-")) {
        if (table[i][0]) {
          s = table[i][0].replace(/\s+/g, "").trim();
          temp.push(s);
        }
        for (let j = 1; j < 16; j++) {
          s = "";
          if (table[i][j]) s = table[i][j].replace(/\s+/g, " ").trim();
          temp.push(s);
        }
        output.push(temp);
      }
    }
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
