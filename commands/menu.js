function main(bot) {
  bot.command("menu", (ctx) => {
    console.log(
      `[Command] Користувач ${ctx.chat.username} (${ctx.chat.id}) використав команду /menu`
    );
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
