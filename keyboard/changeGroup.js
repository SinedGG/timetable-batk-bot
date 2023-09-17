const { Markup } = require("telegraf");

module.exports = {
  keyboard() {
    return new Promise(async (resolve, reject) => {
      const { getLast } = require("../models/timetable");
      const timetable = await getLast();
      const buttons = timetable.table.map((obj) => [
        Markup.button.callback(obj.group, `groupChange ${obj.group}`),
      ]);
      const keyboard = Markup.inlineKeyboard(buttons);
      resolve(keyboard);
    });
  },
  execute(bot) {
    bot.on("callback_query", async (ctx) => {
      const subscribed = await require("../modules/ifUserSubscribed")(ctx);
      if (!subscribed) return;

      const callbackData = ctx.update.callback_query.data;
      if (!callbackData.includes("groupChange")) return;
      const buttonText = ctx.update.callback_query.data.replace(
        "groupChange ",
        ""
      );
      const { setGroup } = require("../models/user");
      await setGroup(ctx.from.id, buttonText);
      ctx.answerCbQuery(`Групо оновлено: ${buttonText}`);
      const keyboard = Markup.inlineKeyboard([
        Markup.button.callback(
          "Вашу групу було оновлено ♻️: " + buttonText,
          "group_updated"
        ),
      ]);
      ctx.editMessageText("⚙️ Налаштування групи", keyboard);
    });
  },
};
