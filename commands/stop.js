module.exports = {
  name: "stop",
  async execute(ctx) {
    const deleteUser = require("../models/user").delete;

    try {
      await deleteUser(ctx.from.id);
      console.log(
        `[Command] User ${ctx.from.username} (${ctx.from.id}) deleted from database.`
      );
      ctx.reply("👌");
    } catch (err) {
      if (err.code == "P2025") ctx.reply(`Упс... Здається вас немає у базі.`);
    }
  },
};
