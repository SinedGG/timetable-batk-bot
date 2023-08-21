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

const get_file_size = require("./modules/fileSizreByURL");
const download_file = require("./modules/downloadFileFromURL");
const get_day_pdf = require("./modules/getDayPDF");
const parse_pdf = require("./modules/parsePDF");
const send_table = require("./modules/send/send_table");
const send_group = require("./modules/send/send_group");
const send_teacher = require("./modules/send/send_teacher");
const keyboard = require("./keyboard/index");
keyboard(bot, db);

init();
async function init() {
  console.log(`[Initialization] Ініціалізація.`);
  try {
    var [[{ value: old_pdf_size }]] = await db.query(
      `SELECT value FROM properties WHERE type='old_pdf_size'`
    );
    main(old_pdf_size);
  } catch (error) {
    console.log(`[DB Error] Помилка отримаання розміру файла з бази даних!`);
    setTimeout(() => {
      init();
    }, 30 * 1000);
  }
}

async function main(old_size) {
  try {
    var new_size = await get_file_size(bot.cfg.url.pdf);
    if (old_size != new_size.size) {
      console.log(
        `[File size PDF] Old size - ${old_size} : New size ${new_size.size} Request time - ${new_size.time}`
      );
      await download_file(bot.cfg.url.pdf, bot.cfg.path.pdf);
      await parse_pdf(db, bot.cfg);
      var day = await get_day_pdf(bot.cfg);
      var [[{ value: last_day }]] = await db.query(
        `SELECT * FROM properties where type='last_days'`
      );
      await send_group(bot, db, bot.cfg, day, last_day);
      await send_table(bot, db, bot.cfg, day, last_day);
      await send_teacher(bot, db, bot.cfg, day, last_day);
      old_size = new_size.size;
      await db.query(`
      UPDATE properties SET value = ${old_size} WHERE type='old_pdf_size';
      update properties set value = "${day}" where type='last_days'`);
      cycle(old_size, 60);
    } else {
      cycle(old_size, 30);
    }
  } catch (error) {
    console.log(error.message);
    cycle(old_size, 60);
  }
}

function cycle(size, sec) {
  setTimeout(() => {
    main(size);
  }, sec * 1000);
}

bot.launch();

require("./modules/dailyMailing.js")(bot, db);

/*
process.on("uncaughtException",  (err) => {
  console.log("err");
});
*/
