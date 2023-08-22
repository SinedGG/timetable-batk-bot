module.exports = (bot, db) => {
  const schedule = require("node-schedule");

  schedule.scheduleJob("0 0 6 * * *", async () => {
    var [users] = await db.query(`SELECT * FROM users `);
    if (users.length == 0) return;
    for (var i = 0; i < users.length; i++) {
      await bot.telegram
        .sendPhoto(
          users[i].chat_id,
          { source: "./file/silence.jpg" },
          {
            disable_notification: true,
          }
        )
        .catch((err) => {
          console.log(err);
        });
      console.log(
        `[dailyMailing] Спроба надсилання розсилки для - ${users[i].chat_id}`
      );
    }
  });
};
