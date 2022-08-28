const fs = require("fs");
const cfg = JSON.parse(fs.readFileSync("./config/main.json", "utf8"));

function main(bot, db, content, day) {
  return new Promise(async (resolve, reject) => {
    var [users] = await db.query(
      `SELECT * FROM users WHERE group_type='${content.course}'`
    );
    var [[{ value: last_day }]] = await db.query(
      `SELECT * FROM properties where type='last_days'`
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
        if (content.course == "table") {
          text = `${text} на ${day}`;
        } else {
          text = `${text}\nДля групи ${content.course} на ${day} \n\n${content.lesson1} [ ${content.classroom1} ]\n${content.lesson2} [ ${content.classroom2} ]\n${content.lesson3} [ ${content.classroom3} ]\n${content.lesson4} [ ${content.classroom4} ]`;
        }
        console.log(
          `[Send] Спроба надсилання розкладу для - ${users[i].chat_id}, група - ${content.course}`
        );
        try {
          if (users[i].download_file) {
            await bot.telegram.sendDocument(
              users[i].chat_id,
              { source: cfg.pdfpatch },
              {
                disable_notification: disable_notification,
                caption: text,
              }
            );
          } else {
            await bot.telegram.sendMessage(users[i].chat_id, text, {
              disable_notification: disable_notification,
            });
          }
        } catch (err) {
          if (
            err.message.includes("403: Forbidden: bot was blocked by the user")
          ) {
            var user = err.on.payload.chat_id;
            await db.query(`DELETE FROM users WHERE chat_id =${user}`);
            console.log(
              `[DB] Користувача ${user} видалено з бази даних у зв'язку з блокуванням`
            );
          }
          if (err.message.includes("429: Too Many Requests: retry after")) {
            console.log("Too Many Requests");
          }
        }
        //await delay(100);
      }
      resolve();
    }

    /*

    db.query(
      `SELECT * FROM users WHERE group_type='${content.course}'`,
      (err, users) => {
        if (err) {
          console.log(
            `[DB Error] Помилка отримання користувачів групи ${content.course} даних з бази даних!`,
            err
          );
        }
        if (users.length == 0) {
          resolve();
        } else {
          var pass = true;
          loop(0);
          function loop(i) {
            if (i < users.length) {
              var text;
              var disable_notification = true;
              if (days[0] != days[1]) {
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
              if (content.course != "table") {
                text = `${text}\nДля групи ${content.course} на ${days[1]} \n\n${content.lesson1} [ ${content.classroom1} ]\n${content.lesson2} [ ${content.classroom2} ]\n${content.lesson3} [ ${content.classroom3} ]\n${content.lesson4} [ ${content.classroom4} ]`;
              } else {
                text = `${text} на ${days[1]}`;
              }
              console.log(
                `[Send] Спроба надсилання розкладу для - ${users[i].chat_id}, група - ${content.course}`
              );
              bot.telegram
                .sendDocument(
                  users[i].chat_id,
                  { source: cfg.pdfpatch },
                  {
                    disable_notification: disable_notification,
                    caption: text,
                  }
                )
                .catch((err) => {
                  if (
                    err.message.includes("403: Forbidden: bot was blocked by the user")
                  ) {
                    const delete_user = require("./delete_user");
                    delete_user(db, err.on.payload.chat_id);
                  }
                  if (err.message.includes("429: Too Many Requests: retry after")) {
                    console.log("Too Many Requests")
                  }
                });
              if (pass) {
                debug_send_text(bot, text);
                pass = false;
              }
              i++;
              setTimeout(() => {
                loop(i);
              }, 100);
            } else {
              setTimeout(() => {
                resolve();
              }, 3000);
            }
          }
        }
      }
    );
    */
  });
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function debug_send_text(bot, text) {
  bot.telegram
    .sendDocument(
      cfg.log_channel,
      { source: cfg.pdfpatch },
      { disable_notification: true, caption: text }
    )
    .catch((err) => {
      if (err.message.includes("429: Too Many Requests: retry after")) {
        setTimeout(() => {
          debug_send_text(bot, text);
        }, 60000);
      }
    });
}

module.exports = main;
