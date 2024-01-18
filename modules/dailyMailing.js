module.exports = (bot) => {
  const schedule = require("node-schedule");

  schedule.scheduleJob("0 58 6 * * *", async () => {
    const users = await require("../models/user").getAll();
    if (users.length == 0) return;
    for (var i = 0; i < users.length; i++) {
      await bot.telegram
        .sendPhoto(
          users[i].tg_id.toString(),
          { source: "./temp/silence.jpg" },
          {
            disable_notification: true,
          }
        )
        .catch((err) => {
          console.log(err);
        });
      console.log(
        `[dailyMailing] Спроба надсилання розсилки для - ${users[
          i
        ].tg_id.toString()}`
      );
    }
  });
};
