const fs = require("fs");
const cfg = JSON.parse(fs.readFileSync("./config/main.json", "utf8"));

function r(bot, db){
    bot.start((ctx) => {
        db.query(
          `INSERT users (chat_id) values (${ctx.message.chat.id})`,
          function (err) {
            if (err) {
              console.log(
                "DB Error",
                `Помилка додавання користувача ${ctx.message.chat.id} до бази даних!`,
                err
              );
              if (err.code == "ER_DUP_ENTRY") {
                console.log(
                  "User",
                  `Користувач ${ctx.message.chat.id} вже є у базі даних`
                );
                ctx.reply ("Хм... Здається ви вже є у базі даних. \nЯкщо ви бажаєте змінити налаштування розкладу використайте /menu ➾ ⚙️ Налаштування");
              }
            } else {
              console.log(
                "DB",
                `Користувача ${ctx.message.chat.id} додано до бази даних!`
              );
              ctx.telegram.sendMessage(ctx.chat.id, "* Виберіть опцію для надсилання розкладу: * \n \n *👨‍🎓 Вибір групи* - отримувати розклад конкретної групи у текстовому форматі. \n *📅 Отримувати розклад-таблицю* - отримувати розклад у форматі таблиці (_як на сайті_)",{
                "parse_mode": "markdown",
                reply_markup: {
                  parse_mode: "markdown",
                  keyboard: [
                    [
                      { text: "👨‍🎓 Вибір групи" },
                      { text: "📅 Отримувати розклад-таблицю" },
                    ],
                  ],
                  resize_keyboard: true,
                  one_time_keyboard: true,
                },
              });
            }
          }
        );
      });
      
      function IfAdminPermision(id) {
        var admin_id = cfg.adminchat_id;
        return new Promise((resolve, reject) => {
          for (let index = 0; index < admin_id.length; index++) {
            console.log(admin_id)
            if (id == admin_id[index]) {
              resolve();
            }
            if (index + 1 == admin_id.length) {
              reject();
            }
          }
        });
      }
      
      bot.command("stop", (ctx) => {
        db.query(
          `DELETE FROM users WHERE chat_id =${ctx.message.chat.id}`,
          function (err) {
            if (err) {
              console.log(
                "DB Error",
                `Помилка видалення користувача ${ctx.message.chat.id} з бази даних!`,
                err
              );
            } else {
              console.log(
                "DB",
                `Користувача ${ctx.message.chat.id} видалено з бази даних!`
              );
              ctx.reply("👌");
            }
          }
        );
      });
      
      bot.command("getid", (ctx) => {
        ctx.reply(ctx.message.chat.id);
        console.log(
          "Getid",
          `Користувач ${ctx.message.chat.username} ID - ${ctx.message.chat.id}`
        );
      });
      
      bot.command("help", (ctx) => {
        ctx.reply("Для питань і пропозицій @berezovsky23");
      });
      
      bot.command("version", (ctx) => {
        ctx.reply("Vesion: " + cfg.version);
      });
      
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
      
      
      bot.command("report", (ctx) => {
        ctx.reply("Для зв'язку з розробником -  @berezovsky23");
      });
      
}

module.exports = r;