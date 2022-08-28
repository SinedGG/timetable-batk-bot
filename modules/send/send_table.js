function main(bot, db, cfg, day, last_day) {
  return new Promise(async (resolve) => {
    var [users] = await db.query(
      `SELECT * FROM users WHERE group_type='table'`
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

        text = `${text} на ${day}`;
        console.log(
          `[Send] Спроба надсилання розкладу для - ${users[i].chat_id}, група - table`
        );

        bot.telegram
          .sendDocument(
            users[i].chat_id,
            { source: cfg.path.pdf },
            {
              disable_notification: disable_notification,
              caption: text,
            }
          )
          .catch((err) => {
            if (
              err.message.includes(
                "403: Forbidden: bot was blocked by the user"
              )
            ) {
              var user = err.on.payload.chat_id;
              db.query(`DELETE FROM users WHERE chat_id =${user}`);
              console.log(
                `[DB] Користувача ${user} видалено з бази даних у зв'язку з блокуванням.`
              );
            }
            if (err.message.includes("429: Too Many Requests: retry after")) {
              console.log("Too Many Requests");
            }
          });

        await delay(100);
      }
      resolve();
    }
  });
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = main;
