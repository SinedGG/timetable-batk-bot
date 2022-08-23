function main(bot, db) {
  bot.command("stop", (ctx) => {
    db.query(`DELETE FROM users WHERE chat_id =${ctx.message.chat.id}`);
    console.log(
      `[Command] Користувача ${ctx.message.chat.username} (${ctx.message.chat.id}) видалено з бази даних.`
    );
    bot.telegram
      .sendMessage(ctx.message.chat.id, "👌", {
        reply_markup: { remove_keyboard: true },
      })
      .catch((err) => {});
  });
}

module.exports = main;
