const pdf_table_extractor = require("pdf-table-extractor");
const fs = require("fs");
const cfg = JSON.parse(fs.readFileSync("./config/main.json", "utf8"));

async function r() {
  return new Promise((resolve, reject) => {
    pdf_table_extractor(cfg.pdfpatch, success, error);
    console.log(`[Parce PDF] Початок парсингу файлу.`)
    function success(result) {
      var table = result.pageTables[0].tables;

      var output = [];

      for (var i = 0; i < table.length; i++) {
        var content = {};
        content.course = table[i][0].replace(/\s+/g, "").trim();
        content.lesson1 = table[i][1].replace(/\s+/g, " ").trim();
        content.classroom1 = table[i][2].replace(/\s+/g, " ").trim();
        content.lesson2 = table[i][3].replace(/\s+/g, " ").trim();
        content.classroom2 = table[i][4].replace(/\s+/g, " ").trim();
        content.lesson3 = table[i][5].replace(/\s+/g, " ").trim();
        content.classroom3 = table[i][6].replace(/\s+/g, " ").trim();
        content.lesson4 = table[i][7].replace(/\s+/g, " ").trim();
        content.classroom4 = table[i][8].replace(/\s+/g, " ").trim();
        content.lesson5 = table[i][9];
        content.classroom5 = table[i][10];

        for (var k = 1; k < content.classroom1.length; k++) {
          var letter = content.classroom1.slice(k, k + 1);
          if (isNaN(letter)) {
            if (letter === letter.toUpperCase()) {
              if (content.classroom1.slice(k - 1, k) == " ") {
                lesson2 = content.classroom1.slice(
                  k,
                  content.classroom1.length
                );
                content.classroom1 = content.classroom1.slice(0, k);
              }
            }
          }
        }

        for (var k = 1; k < content.classroom2.length; k++) {
          var letter = content.classroom2.slice(k, k + 1);
          if (isNaN(letter)) {
            if (letter === letter.toUpperCase()) {
              if (content.classroom2.slice(k - 1, k) == " ") {
                lesson3 = content.classroom2.slice(
                  k,
                  content.classroom2.length
                );
                content.classroom2 = content.classroom2.slice(0, k);
              }
            }
          }
        }

        for (var k = 1; k < content.classroom3.length; k++) {
          var letter = content.classroom3.slice(k, k + 1);
          if (isNaN(letter)) {
            if (letter === letter.toUpperCase()) {
              if (content.classroom3.slice(k - 1, k) == " ") {
                lesson4 = content.classroom3.slice(
                  k,
                  content.classroom3.length
                );
                content.classroom3 = content.classroom3.slice(0, k);
              }
            }
          }
        }
        if (content.course != "" && content.course != "Група") {
          output.push(content);
        }
      }
      console.log(`[Parce PDF] Парсинг успішний.`)
      resolve(output);
      /*
      db.query("TRUNCATE table timetable", function (err) {
        if (err) {
          reject(
            new Error(`[DB Error] Помилка очистки таблиці timetable`, err)
          );
        }
      });

      const db_request =
        "INSERT timetable (course, lesson1, classroom1, lesson2 ,classroom2, lesson3,classroom3, lesson4,classroom4, lesson5, classroom5) VALUES ?";
      db.query(db_request, [value], function (err) {
        if (err) {
          reject(
            new Error(`[DB Error] Помилка оновлення таблиці timetable`, err)
          );
        } else {
          resolve();
        }
      });
      */
    }

    function error(err) {
      reject(new Error(`[Parce ERROR] Помилка парсингу pdf файлу`, err));
    }
  });
}

module.exports = r;
