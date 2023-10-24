module.exports = (bot, isTableChanged, caption, group) => {
  return new Promise(async (resolve, reject) => {
    const users = await require("../models/user").getByGroup(group);
    for (let i = 0; i < users.length; i++) {
      var disable_notification = !users[i].notification_n;
      if (isTableChanged) disable_notification = !users[i].notification_z;
      console.log(
        `[Send] Спроба надсилання розкладу для - ${users[
          i
        ].tg_id.toString()}, група - ${group}`
      );
      await send(bot, users[i], caption, disable_notification);
    }
    resolve();
  });
};

function send(bot, user, caption, disable_notification) {
  const deleteUser = require("../models/user").delete;

  return new Promise(async (resolve, reject) => {
    try {
      if (user.download_file) {
        await bot.telegram.sendDocument(
          user.tg_id.toString(),
          { source: "./temp/zm.pdf" },
          { caption, disable_notification }
        );
      } else {
        await bot.telegram.sendMessage(user.tg_id.toString(), caption, {
          disable_notification,
        });
      }
      resolve();
    } catch (err) {
      resolve();
      console.log(err);
      var userId = err.on.payload.chat_id;
      if (err.message.includes("403: Forbidden: bot was blocked by the user")) {
        await deleteUser(userId);
        console.log(
          `[DB] Користувача ${user} видалено з бази даних у зв'язку з блокуванням`
        );
      } else if (err.message.includes("Forbidden: user is deactivated")) {
        await await deleteUser(userId);
        console.log(
          `[DB] Користувача ${user} видалено з бази даних, аккаунт не активний`
        );
      } else if (err.message.includes("429: Too Many Requests: retry after")) {
        console.log("Too Many Requests");
      }
    }
  });
}
