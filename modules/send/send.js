async function main(bot, db, cfg, users, text, disable_notification) {
  try {
    if (users.download_file) {
      await bot.telegram.sendDocument(
        users.chat_id,
        { source: cfg.path.pdf },
        {
          disable_notification: disable_notification,
          caption: text,
        }
      );
    } else {
      await bot.telegram.sendMessage(users.chat_id, text, {
        disable_notification: disable_notification,
      });
    }
  } catch (err) {
    console.log(err);
    var user = err.on.payload.chat_id;
    if (err.message.includes("403: Forbidden: bot was blocked by the user")) {
      await db.query(`DELETE FROM users WHERE chat_id =${user}`);
      console.log(
        `[DB] Користувача ${user} видалено з бази даних у зв'язку з блокуванням`
      );
    } else if (err.message.includes("Forbidden: user is deactivated")) {
      await db.query(`DELETE FROM users WHERE chat_id =${user}`);
      console.log(
        `[DB] Користувача ${user} видалено з бази даних, аккаунт не активний`
      );
    } else if (err.message.includes("429: Too Many Requests: retry after")) {
      console.log("Too Many Requests");
    }
  }
}

module.exports = main;
