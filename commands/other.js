function main(bot) {
  bot.command("id", (ctx) => {
    ctx.reply(`Ваш id - ${ctx.message.chat.id}`).catch((err) => {});
    console.log(
      `[Command] Користувач ${ctx.chat.username} (${ctx.chat.id}) використав команду /id`
    );
  });

  bot.command("help", (ctx) => {
    ctx.reply("Для питань і пропозицій @berezovsky23").catch((err) => {});
    console.log(
      `[Command] Користувач ${ctx.chat.username} (${ctx.chat.id}) використав команду /help`
    );
  });
}

module.exports = main;
