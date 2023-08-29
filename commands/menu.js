module.exports = {
  name: "menu",
  async execute(ctx) {
    const { keyboard } = require("../keyboard/menu");
    ctx.reply("Меню 📋", keyboard);
    console.log(
      `[Command] Користувач ${ctx.from.username} (${ctx.from.id}) використав команду /menu`
    );
  },
};
