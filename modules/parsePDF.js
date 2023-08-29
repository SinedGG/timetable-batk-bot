module.exports = () => {
  return new Promise(async (resolve, reject) => {
    const PDFJS = require("pdfjs-dist/build/pdf.js");
    const parse = require("./assemble_table.js");

    var doc = await PDFJS.getDocument("./temp/zm.pdf").promise;
    var table = await parse(PDFJS, doc);
    const arr = [];

    table.forEach((row) => {
      if (!row[0] || row[0].replace(/\s+/g, "").trim() == "Група") return;
      const obj = {
        group: row[0].replace(/\s+/g, "").trim(),
        lessons: [],
      };
      for (let i = 1; i < row.length; i += 3) {
        obj.lessons.push({
          cabinet: row[i + 2].replace(/\s+/g, " ").trim(),
          subject: row[i].replace(/\s+/g, " ").trim(),
          teacher: row[i + 1].replace(/\s+/g, " ").trim(),
        });
      }
      arr.push(obj);
    });
    resolve(arr);
  });
};
