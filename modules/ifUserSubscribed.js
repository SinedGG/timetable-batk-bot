module.exports = (ctx) => {
  return new Promise(async (resolve, reject) => {
    const fingUser = require("../models/user").getOne;
    const user = await fingUser(ctx.from.id);
    if (!user) {
      ctx.reply(
        "Ви не можете відкрити налаштування коли вас немає у базі даних. Для старту використайте /start"
      );
      resolve(false);
    } else resolve(true);
  });
};
