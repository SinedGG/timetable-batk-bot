const download_file = require("../modules/downloadFileFromURL");

function main(bot) {
  bot.command("zm", async (ctx) => {
    console.log(
      `[Command] Користувач ${ctx.chat.username} (${ctx.chat.id}) використав команду /zm`
    );
    await download_file(bot.cfg.url.pdf, bot.cfg.path.pdf);
    ctx.telegram
      .sendDocument(ctx.chat.id, { source: bot.cfg.path.pdf })
      .catch((err) => {});
  });
}

module.exports = main;
