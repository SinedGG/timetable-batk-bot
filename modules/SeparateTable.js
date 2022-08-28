const send_messgae = require("./sendMessage");
const get_day = require("./getDayPDF.js");

function main(bot, db, day) {
  return new Promise(async (resolve) => {
    var [t_new] = await db.query(`select * from timetable_xls`);
    for (var i = 0; i < t_new.length; i++) {
      var [t_old] = await db.query(
        `SELECT * FROM timetable_xls_old WHERE course='${t_new[i].course}'`
      );
      if (t_old[0]) {
        if (
          t_new[i].lesson1 != t_old[0].lesson1 ||
          t_new[i].lesson2 != t_old[0].lesson2 ||
          t_new[i].lesson3 != t_old[0].lesson3 ||
          t_new[i].lesson4 != t_old[0].lesson4 ||
          t_new[i].lesson5 != t_old[0].lesson5 ||
          t_new[i].classroom1 != t_old[0].classroom1 ||
          t_new[i].classroom2 != t_old[0].classroom2 ||
          t_new[i].classroom3 != t_old[0].classroom3 ||
          t_new[i].classroom4 != t_old[0].classroom4 ||
          t_new[i].classroom5 != t_old[0].classroom5 ||
          t_new[i].teacher1 != t_old[0].teacher1 ||
          t_new[i].teacher2 != t_old[0].teacher2 ||
          t_new[i].teacher3 != t_old[0].teacher3 ||
          t_new[i].teacher4 != t_old[0].teacher4 ||
          t_new[i].teacher5 != t_old[0].teacher5
        ) {
          await send_messgae(bot, db, t_new[i], day);
        }
      }
    }
    resolve();
  });
}

module.exports = main;
