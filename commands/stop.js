function r(bot, db) {
  bot.command("stop", (ctx) => {
    db.query(
      `DELETE FROM users WHERE chat_id =${ctx.message.chat.id}`,
      function (err) {
        if (err) {
          logger(
            "DB Error",
            `Помилка видалення користувача ${ctx.message.chat.id} з бази даних!`,
            err
          );
        } else {
          logger(
            "DB",
            `Користувача ${ctx.message.chat.id} видалено з бази даних!`
          );
          ctx.reply("👌");
        }
      }
    );
  });
}

module.exports = r;
