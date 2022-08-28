function main(bot, db) {
  bot.command("st", (ctx) => {
    var args = ctx.message.text.split(" ");
    if (!args[1]) return ctx.reply("Некоректні дані.").catch((err) => {});
    db.query(
      `UPDATE users SET group_type='teacher', last_name=? WHERE chat_id=${ctx.chat.id}`,
      args[1]
    );
    ctx.reply(`Прізвище встановлено - ${args[1]}`).catch((err) => {});
    console.log(
      `[Teacher] Встановлено групу teacher з прізвищем ${args[1]} для користувача ${ctx.chat.username} (${ctx.chat.id})`
    );
  });
}

module.exports = main;
