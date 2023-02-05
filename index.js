require("dotenv").config();
const { Telegraf } = require("telegraf"),
  bot = new Telegraf(process.env.TG_TOKEN),
  http = require("http"),
  fs = require("fs"),
  request = require("request"),
  mysql = require("mysql2/promise"),
  cfg = require("./config.js"),
  schedule = require("node-schedule");

const delay = require("node:timers/promises").setTimeout;

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

bot.start(async (ctx) => {
  var user = ctx.message.chat.id;
  try {
    await db.query(`INSERT users (chat_id) values (${user})`);
    console.log(`Користувача - ${user} додано до бази даних.`);
    ctx.reply(
      "Чудово! Тепер ви будете отримувати свіжий розклад одразу після його публікації⚡️"
    );
  } catch (err) {
    ctx.reply("Здається ви вже є у базі даних.");
  }
});

bot.command("stop", async (ctx) => {
  var user = ctx.message.chat.id;
  try {
    await db.query(`DELETE FROM users WHERE chat_id = ${user} `);
    console.log(`Користувача ${user} видадено з бази даних.`);
    ctx.reply("👌");
  } catch (err) {
    ctx.reply(`Упс... Сталась помилка.`);
  }
});

bot.command("id", (ctx) => {
  ctx.reply(ctx.message.chat.id);
});

bot.command("stats", async (ctx) => {
  try {
    var [rows] = await db.query("SELECT chat_id FROM users");
    var users_count = rows.length;
    var days = Math.ceil(
      (new Date().getTime() - new Date(cfg.start_date).getTime()) /
        1000 /
        60 /
        60 /
        24
    );
    ctx.reply(
      `Працює безперервно - ${days}  📈\nКористувачів підписано - ${users_count} 👨‍🎓`
    );
  } catch (err) {}
});

init();
async function init() {
  try {
    var [rows] = await db.query(
      `SELECT value FROM properties WHERE type='OldFileSize'`
    );
    main(rows[0].value);
  } catch (err) {
    console.log(`[DB Error] Помилка отримаання розміру файла з бази даних!`);
    setTimeout(() => {
      init();
    }, 120 * 1000);
  }
}

const get_size = require("./modules/file_size_by_url.js");
const download_file = require("./modules/download_file.js");

async function main(old_size) {
  try {
    var new_size = await get_size();
    if (new_size != old_size) {
      await download_file();
      var [users] = await db.query(`SELECT chat_id FROM users`);
      var [TimetableSendToday] = await db.query(
        `SELECT value FROM properties WHERE id=3`
      );
      var caption = "Новий розклад📚";
      if (TimetableSendToday[0].value) caption = "Зміни в розкладі📚";
      for (let i = 0; i < users.length; i++) {
        console.log(`Спроба надсилання розкладу для - ${users[i].chat_id}`);
        bot.telegram
          .sendDocument(
            users[i].chat_id,
            {
              source: cfg.pdfpatch,
            },
            { caption: caption }
          )
          .catch((err) => {
            if (
              err.message.includes(
                "403: Forbidden: bot was blocked by the user"
              )
            ) {
              db.query(`DELETE FROM users WHERE chat_id =${users[i].chat_id}`);
              console.log(
                `[DB] Користувача ${users[i].chat_id} видалено з бази даних у зв'язку з блокуванням.`
              );
            }
            if (err.message.includes("429: Too Many Requests: retry after")) {
              console.log("Too Many Requests");
            }
          });

        await delay(100);
      }

      old_size = new_size;

      db.query(`
        UPDATE properties SET value = ${new_size} WHERE id=1`);
      db.query(`UPDATE properties SET value=1 WHERE id=3`);
    }
    setTimeout(() => {
      main(old_size);
    }, 30 * 1000);
  } catch (err) {
    console.log(err.message);
    setTimeout(() => {
      main(old_size);
    }, 60 * 1000);
  }
}

schedule.scheduleJob("9 9 9 * * *", () => {
  db.query("UPDATE properties SET value=0 WHERE id=3");
});

bot.launch();
