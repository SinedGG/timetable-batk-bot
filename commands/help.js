module.exports = {
  name: "help",
  async execute(ctx) {
    ctx.reply("Для питань і пропозицій @berezovsky23");
    console.log(
      `[Command] Користувач ${ctx.from.username} (${ctx.from.id}) використав команду /help`
    );
  },
};
