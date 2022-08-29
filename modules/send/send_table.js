const send = require("./send");

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

        send(bot, db, cfg, users[i], text, disable_notification);

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
