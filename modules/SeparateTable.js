const send_messgae = require("./sendMessage");

async function r(bot, db, value) {
  var timetable_new = value[2];
  return new Promise((resolve, reject) => {
    for (let index = 0; index < timetable_new.length; index++) {
      db.query(
        `SELECT * FROM timetable WHERE course='${timetable_new[index].course}'`,
        (err, rows) => {
          if (err) {
            reject(
              new Error(`[DB Error] Помилка отримання даних з бази даних!`, err)
            );
          } else {
            console.log('rows = ', rows[0])
            if (rows[0]) {
              if (
                timetable_new[index].lesson1 != rows[0].lesson1 ||
                timetable_new[index].lesson2 != rows[0].lesson2 ||
                timetable_new[index].lesson3 != rows[0].lesson3 ||
                timetable_new[index].lesson4 != rows[0].lesson4 ||
                timetable_new[index].lesson5 != rows[0].lesson5 ||
                timetable_new[index].classroom1 != rows[0].classroom1 ||
                timetable_new[index].classroom2 != rows[0].classroom2 ||
                timetable_new[index].classroom3 != rows[0].classroom3 ||
                timetable_new[index].classroom4 != rows[0].classroom4 ||
                timetable_new[index].classroom5 != rows[0].classroom5
              ) {
                send_messgae(bot, db, timetable_new[index], value);
                console.log(
                  `--------------------------------------------------`
                );
                console.log(`Гурпа ${timetable_new[index].course}`);
                console.log(
                  `${timetable_new[index].lesson1}[${timetable_new[index].classroom1}] | ${rows[0].lesson1} [${rows[0].classroom1}]`
                );
                console.log(
                  `${timetable_new[index].lesson2}[${timetable_new[index].classroom2}] | ${rows[0].lesson2} [${rows[0].classroom2}]`
                );
                console.log(
                  `${timetable_new[index].lesson3}[${timetable_new[index].classroom3}] | ${rows[0].lesson3} [${rows[0].classroom3}]`
                );
                console.log(
                  `${timetable_new[index].lesson4}[${timetable_new[index].classroom4}] | ${rows[0].lesson4} [${rows[0].classroom4}]`
                );
                console.log(
                  `--------------------------------------------------`
                );
              }
            }
          }
        }
      );
    }
    setTimeout(() => {
      resolve();
    }, 10000);
  });
}

module.exports = r;
