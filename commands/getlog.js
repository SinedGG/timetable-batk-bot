function r(bot, db) {
  bot.command("getlog", (ctx) => {
    if (ctx.message.chat.id == "460266962") {
      bot.telegram
        .sendDocument(
          ctx.message.chat.id,
          { source: "./log/last.txt" },
          { disable_notification: true, caption: "Last log" }
        )
        .catch((err) => {
          if (err.message == "400: Bad Request: file must be non-empty") {
            ctx.reply("Log file is empty!");
          }
        });
    }
  });
}

module.exports = r;
