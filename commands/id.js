module.exports = {
  name: "id",
  async execute(ctx) {
    ctx.reply(`Ваш id: ${ctx.from.id}`);
    console.log(
      `[Command] Користувач ${ctx.from.username} (${ctx.from.id}) використав команду /id`
    );
  },
};
