const { Telegraf } = require("telegraf");
require("dotenv").config();
const bot = new Telegraf(process.env.TG_TOKEN);
const fs = require("fs");
const mysql2 = require("mysql2/promise");
bot.cfg = require("./config.js");

const db = mysql2.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  multipleStatements: true,
});

fs.readdirSync("./commands/").forEach((file) => {
  require(`./commands/${file}`)(bot, db);
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
async function init() {
  console.log(`[Initialization] Ініціалізація.`);
  try {
    var [[{ value: old_size }]] = await db.query(
      `SELECT value FROM properties WHERE type='OldFileSize' `
    );
    main(old_size);
  } catch (error) {
    console.log(`[DB Error] Помилка отримаання розміру файла з бази даних!`);
    setTimeout(() => {
      init();
    }, 30 * 1000);
  }
}

async function main(old_size) {
  try {
    var new_size = await get_file_size(bot.cfg.url);
    if (old_size != new_size.size) {
      console.log(
        `[File size] Old size - ${old_size} : New size ${new_size.size} Request time - ${new_size.time}`
      );
      await download_file(bot.cfg.url, bot.cfg.pdfpatch);
      var day = await get_day(bot.cfg);
      await send_table(bot, db, { course: "table" }, day);
      old_size = new_size.size;
      await db.query(`
      UPDATE properties SET value = ${new_size.size} WHERE type='OldFileSize';
      update properties set value = "${day}" where type='last_days'`);
      setTimeout(() => {
        main(old_size);
      }, 120 * 1000);
    } else {
      setTimeout(() => {
        main(old_size);
      }, 30 * 1000);
    }
  } catch (error) {
    console.log(error.message);
    setTimeout(() => {
      main(old_size);
    }, 60 * 1000);
  }
}

const keyboard = require("./keyboard/index");
keyboard(bot, db);

bot.launch();

/*
process.on("uncaughtException",  (err) => {
  console.log("err");
});
*/
