const send = require("./send");
function main(bot, db, cfg, day, last_day) {
  return new Promise(async (resolve, reject) => {
    var [t_new] = await db.query(`select * from timetable_xls`);
    for (var l = 0; l < t_new.length; l++) {
      var [t_old] = await db.query(
        `SELECT * FROM timetable_xls_old WHERE course='${t_new[l].course}'`
      );
      if (t_old[0]) {
        if (
          t_new[l].lesson1 != t_old[0].lesson1 ||
          t_new[l].lesson2 != t_old[0].lesson2 ||
          t_new[l].lesson3 != t_old[0].lesson3 ||
          t_new[l].lesson4 != t_old[0].lesson4 ||
          t_new[l].lesson5 != t_old[0].lesson5 ||
          t_new[l].class1 != t_old[0].class1 ||
          t_new[l].class2 != t_old[0].class2 ||
          t_new[l].class3 != t_old[0].class3 ||
          t_new[l].class4 != t_old[0].class4 ||
          t_new[l].class5 != t_old[0].class5 ||
          t_new[l].teacher1 != t_old[0].teacher1 ||
          t_new[l].teacher2 != t_old[0].teacher2 ||
          t_new[l].teacher3 != t_old[0].teacher3 ||
          t_new[l].teacher4 != t_old[0].teacher4 ||
          t_new[l].teacher5 != t_old[0].teacher5
        ) {
          var content = t_new[l];
          var [users] = await db.query(
            `SELECT * FROM users WHERE group_type='${content.course}'`
          );
          if (users.length == 0) {
            resolve();
          } else {
            for (var i = 0; i < users.length; i++) {
              var text;
              var disable_notification = true;
              if (last_day != day) {
                text = "Новий розклад📚";
                if (users[i].notification_n) {
                  disable_notification = false;
                }
              } else {
                text = "Зміни в розкладі📚";
                if (users[i].notification_z) {
                  disable_notification = false;
                }
              }
              text += `\nДля групи ${content.course} на ${day}`;
              text += `\n\n${content.lesson1} [ ${content.class1} ] ${content.teacher1}`;
              text += `\n${content.lesson2} [ ${content.class2} ] ${content.teacher2}`;
              text += `\n${content.lesson3} [ ${content.class3} ] ${content.teacher3}`;
              text += `\n${content.lesson4} [ ${content.class4} ] ${content.teacher4}`;
              if (content.lesson5)
                text += `\n${content.lesson5} [ ${content.class5} ] ${content.teacher5}`;

              console.log(
                `[Send] Спроба надсилання розкладу для - ${users[i].chat_id}, група - ${content.course}`
              );
              send(bot, db, cfg, users[i], text, disable_notification);
              await delay(50);
            }
          }
        }
      }
    }
    resolve();
  });
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = main;
