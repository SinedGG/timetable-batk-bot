const send = require("./send");
function main(bot, db, cfg, day, last_day) {
  return new Promise(async (resolve, reject) => {
    var [users] = await db.query(
      `SELECT * FROM users WHERE group_type='teacher'`
    );
    var [t_new] = await db.query(`select * from timetable_xls`);
    var [t_old] = await db.query(`select * from timetable_xls_old`);

    if (users.length == 0) {
      resolve();
    } else {
      for (let i = 0; i < users.length; i++) {
        try {
          var name = users[i].last_name;
          var lessons = {
            new: "",
            old: "",
          };
          for (let j = 1; j < 6; j++) {
            // let j = 1; j < 6; -  5 пар в день
            for (let k = 0; k < t_new.length; k++) {
              var s = t_new[k];
              var table_name = s[`teacher${j}`];
              if (table_name.toLowerCase().includes(name.toLowerCase())) {
                lessons.new += `\nПара ${j}:\n${s[`lesson${j}`]} [ ${
                  s[`class${j}`]
                } ] ${s[`course`]}`;
              }
            }
          }
          for (let j = 1; j < 6; j++) {
            for (let k = 0; k < t_old.length; k++) {
              var s = t_old[k];
              if (s[`teacher${j}`].includes(name)) {
                lessons.old += `\nПара ${j}:\n${s[`lesson${j}`]} [ ${
                  s[`class${j}`]
                } ] ${s[`course`]}`;
              }
            }
          }
          if (lessons.new != lessons.old) {
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

            text += `на ${day}`;
            text += `\nдля викладача ${name} ${lessons.new}`;
            console.log(
              `[Send] Спроба надсилання розкладу для - ${users[i].chat_id}, група - teacher, прізвище - ${name}`
            );
            send(bot, cfg, users[i], text, disable_notification);
          }
          await delay(100);
        } catch (error) {
          console.log(error);
          if (text == null) text = "Новий розклад📚";
          if (disable_notification == null) disable_notification = false;
          send(bot, cfg, users[i], text, disable_notification);
        }
      }
      resolve();
    }
  });
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = main;
