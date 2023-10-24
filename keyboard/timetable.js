const { Markup } = require("telegraf");

module.exports = {
  keyboard: Markup.keyboard([
    ["👨‍🎓 Вибір групи", "📅 Отримувати розклад-таблицю"],
  ])
    .resize()
    .oneTime(),
  execute(bot) {
    bot.hears("👨‍🎓 Вибір групи", async (ctx) => {
      const subscribed = await require("../modules/ifUserSubscribed")(ctx);
      if (!subscribed) return;

      const getKeyboard = require("./changeGroup").keyboard;
      const keyboard = await getKeyboard();
      ctx.reply("👨‍🎓 Виберіть групу з списку:", keyboard);
    });
    bot.hears("📅 Отримувати розклад-таблицю", async (ctx) => {
      const subscribed = await require("../modules/ifUserSubscribed")(ctx);
      if (!subscribed) return;

      const { setGroup } = require("../models/user");
      await setGroup(ctx.from.id, "table");
      console.log(
        `[Group] Встановлено розклад-таблицю для користувача ${ctx.from.username} (${ctx.from.id})`
      );
      ctx.reply("Тепер ви будете отримувати розклад-таблицю 📅");
    });
  },
};
