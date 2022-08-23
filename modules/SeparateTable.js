const send_messgae = require("./sendMessage");
const get_day = require("./GetTimetableDay.js");

function main(bot, db, day) {
  return new Promise(async (resolve, reject) => {
    var [t_new] = await db.query(`select * from timetable`);
    for (var i = 0; i < t_new.length; i++) {
      var [t_old] = await db.query(
        `SELECT * FROM timetable_old WHERE course='${t_new[i].course}'`
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
          t_new[i].classroom5 != t_old[0].classroom5
        ) {
          await send_messgae(bot, db, t_new[i], day);
          console.log("yep");
        }
      }
    }
    await send_messgae(bot, db, { course: "table" }, day);
    resolve();
  });
}

module.exports = main;
