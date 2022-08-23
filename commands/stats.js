function main(bot, db) {
  bot.command("stats", async (ctx) => {
    var [rows] = await db.query("SELECT chat_id FROM users");
    var users_count = rows.length;
    var days = Math.ceil(
      (new Date().getTime() - new Date(bot.cfg.start_date).getTime()) /
        1000 /
        60 /
        60 /
        24
    );
    console.log(
      `[Command] Користувач ${ctx.message.chat.username} (${ctx.message.chat.id}) використав команду /stats`
    );
    ctx
      .reply(
        `Працює безперервно - ${days}  📈\nКористувачів підписано - ${users_count} 👨‍🎓`
      )
      .catch((err) => {});
  });
}

module.exports = main;
