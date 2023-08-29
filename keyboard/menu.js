const { Markup } = require("telegraf");

module.exports = {
  keyboard: Markup.keyboard([["📈 Статистика", "⚙️ Налаштування"]])
    .resize()
    .oneTime(),
  execute(bot) {
    bot.hears("⚙️ Налаштування", async (ctx) => {
      const fingUser = require("../models/user").getOne;
      const user = await fingUser(ctx.from.id);
      if (!user)
        return ctx.reply(
          "Ви не можете відкрити налаштування коли вас немає у базі даних. Для старту використайте /start"
        );

      const { keyboard } = require("./setting");
      ctx.reply("🔧 Виберіть опцію", keyboard);
    });

    bot.hears("📈 Статистика", async (ctx) => {
      const getUserCount = require("../models/user").stats;
      const userCount = await getUserCount();
      const startDate = await require("../models/vars").get("start-date");
      var days = Math.ceil(
        (new Date().getTime() - new Date(startDate.value).getTime()) /
          1000 /
          60 /
          60 /
          24
      );
      ctx.reply(
        `Працює безперервно - ${days}  📈\nКористувачів підписано - ${userCount} 👨‍🎓`
      );
    });
  },
};
