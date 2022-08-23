function main(bot) {
  bot.command("menu", (ctx) => {
    ctx.telegram
      .sendMessage(ctx.chat.id, "Меню 📋", {
        reply_markup: {
          keyboard: [[{ text: "📈 Статистика" }, { text: "⚙️ Налаштування" }]],
          resize_keyboard: true,
        },
      })
      .catch((err) => {});
  });
}

module.exports = main;
