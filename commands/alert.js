const if_admin = require("../modules/if_admin");

function main(bot, db) {
  bot.command("alert", async (ctx) => {
    var chat_id = ctx.chat.id;
    if (await if_admin(bot.cfg, chat_id)) {
      var content = ctx.message.text.replace("/alert ", "");
      var [users] = await db.query(`SELECT * FROM users`);
      for (let i = 0; i < users.length; i++) {
        console.log(
          `[Alert] Спроба надсилання повідомлення для - ${users[i].chat_id}`
        );
        bot.telegram.sendMessage(users[i].chat_id, content).catch((err) => {
          console.log(err);
        });
        await delay(100);
      }
    }
  });
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = main;
