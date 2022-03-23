const { Telegraf } = require("telegraf");
require("dotenv").config();
const bot = new Telegraf(process.env.TG_TOKEN);
const fs = require("fs");
const mysql = require("mysql");

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
});

const cfg = JSON.parse(fs.readFileSync("./config/main.json", "utf8"));

const get_file_size = require("./modules/fileSizreByURL");
const download_file = require("./modules/downloadFileFromURL");
const get_last_day = require("./modules/GetLastDay");
const get_day = require("./modules/GetTimetableDay");
const parse_pdf = require("./modules/parcePDF");
const separate_table = require("./modules/SeparateTable");
const rewrite_table = require("./modules/RewriteTable");
const send_table = require("./modules/sendMessage");

init();

function init() {
  console.log(`[Initialization] Ініціалізація.`);
  db.query(
    `SELECT value FROM properties WHERE type='OldFileSize' `,
    (err, rows) => {
      if (err) {
        console.log(
          `[DB Error] Помилка отримаання розміру файла з бази даних!`,
          err
        );
        setTimeout(() => {
          init();
        }, cfg.check_timeout);
      } else {
        main(rows[0].value);
      }
    }
  );
}

async function main(old_file_size) {
  try {
    var new_file_size = await get_file_size();
    if (old_file_size != new_file_size) {
      console.log(
        `[File size] Old size - ${old_file_size} : New size ${new_file_size}`
      );
      await download_file();
      await Promise.all([get_last_day(db), get_day(), parse_pdf()]).then(
        async (values) => {
          await separate_table(bot, db, values);

          await console.log("Очікування 60 сек");
          await setTimeout(() => {
            send_table(bot, db, { course: "table" }, values[1]);

            setTimeout(() => {
              rewrite_table(db, values[2], values[1], new_file_size);
            }, 15000);
          }, 60000);

          await setTimeout(() => {
            console.log("Continue");
            main(new_file_size);
          }, 90000);
        }
      );
    } else {
      setTimeout(() => {
        main(old_file_size);
      }, cfg.check_timeout);
    }
  } catch (error) {
    console.log(error);
    setTimeout(() => {
      main(old_file_size);
    }, cfg.check_timeout);
  }
}

const keyboard = require("./keyboard/index");
keyboard(bot, db);

const commands = require("./commands/index");
commands(bot, db);

bot.launch();
