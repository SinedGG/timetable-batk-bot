function r(bot, db) {
  bot.command("getid", (ctx) => {
    ctx.reply(ctx.message.chat.id);
  });

  bot.command("help", (ctx) => {
    ctx.reply("Для питань і пропозицій @berezovsky23");
  });

  bot.command("version", (ctx) => {
    ctx.reply("Vesion: " + cfg.version);
  });
  bot.command("zm", (ctx) => {
    ctx.replyWithDocument(
      { source: cfg.pdfpatch },
      { disable_notification: true, caption: "" }
    );
  });

  bot.command("report", (ctx) => {
    ctx.reply("Для зв'язку з розробником -  @berezovsky23");
  });
}

module.exports = r;
