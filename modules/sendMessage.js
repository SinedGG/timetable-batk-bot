const fs = require("fs");
const cfg = JSON.parse(fs.readFileSync("./config/main.json", "utf8"));

async function r(bot, db, content, days) {
  return new Promise((resolve, reject) => {
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
  });
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

module.exports = r;
