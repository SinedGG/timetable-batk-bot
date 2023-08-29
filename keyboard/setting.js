const { Markup } = require("telegraf");

module.exports = {
  keyboard: Markup.keyboard([["📅 Розклад", "🔔 Сповіщення та інше"]])
    .resize()
    .oneTime(),
  execute(bot) {
    bot.hears("📅 Розклад", async (ctx) => {
      const { keyboard } = require("./timetable");
      ctx.reply("🔧 Виберіть опцію", keyboard);
    });
  },
};
