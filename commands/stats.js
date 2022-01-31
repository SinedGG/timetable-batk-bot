function r(bot, db){
    bot.command("stats", (ctx) => {
        db.query("SELECT chat_id FROM users", function (err, result) {
          var user = result;
          db.query("SELECT value FROM properties WHERE id=4", function (err, result) {
            ctx.reply(
              "Працює безперервно - " +
                result[0].value +
                "  📈" +
                "\n" +
                "Користувачів підписано - " +
                user.length +
                " 👨‍🎓"
            );
          });
        });
      });
}

module.exports = r;