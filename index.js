const { Telegraf } = require("telegraf");
const config = require("config");
require("dotenv").config();
const bot = new Telegraf(process.env.TG_TOKEN);
const http = require("http");
const fs = require("fs");
var mysql = require("mysql");
var schedule = require("node-schedule");


bot.start((ctx) => {
  pool.query(
    "INSERT users (ChatId) values (" + ctx.message.chat.id + ")",
    function (err) {
      if (err) {
        ctx.reply("No");
      } else {
        console.log(
          "Користувача - " + ctx.message.chat.id + " додано до списку"
        );
        ctx.reply(
          "Чудово! Тепер ви будете отримувати свіжий розклад одразу після його публікації⚡️"
        );
      }
    }
  );
});


const pool = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
});



var debugging;

function IfAdminPermision(id) {
  var admin_id = config.get("adminchatid");
  return new Promise((resolve, reject) => {
    for (let index = 0; index < admin_id.length; index++) {
      if (id == admin_id[index]) {
        resolve();
      }
      if(index+1 == admin_id.length){
        reject();
      }
    }
  })
}

bot.command("stop", (ctx) => {
  pool.query(
    "DELETE FROM users WHERE ChatId =" + ctx.message.chat.id,
    function (err) {
      console.log(
        "Користувача - " + ctx.message.chat.id + "видалено зі списку"
      );
    }
  );
  ctx.reply("👌");
});

bot.command("getid", (ctx) => {
  ctx.reply(ctx.message.chat.id);
});

bot.command("version", (ctx) => {
  ctx.reply("Vesion: " + config.get("version"));
});

bot.command("debugon", (ctx) => {
  const promise = IfAdminPermision(ctx.message.chat.id);
  promise
  .then(
    result => {
      ctx.reply("Режим відладки ввімкнено!🔧");
    debugging = 1;
    console.log("Режим відладки ввімкнено!");
    },
    error => {
      ctx.reply("У вас немає доступу до команди!");
    }
  );
});

bot.command("debugoff", (ctx) => {
  const promise = IfAdminPermision(ctx.message.chat.id);
  promise
  .then(
    result => {
      ctx.reply("Режим відладки вимкнено!🔧");
    debugging = 1;
    console.log("Режим відладки вимкнено!");
    },
    error => {
      ctx.reply("У вас немає доступу до команди!");
    }
  );
});

bot.command("stats", (ctx) => {
  pool.query("SELECT ChatId FROM users", function (err, result) {
    var user = result
    pool.query("SELECT value FROM properties WHERE id=4", function (err, result) {
      ctx.reply("Працює безперервно - "+ result[0].value + "  📈" + "\n" + "Користувачів підписано - "+ user.length + " 👨‍🎓");
    });
  
  });
});

if ((debugging = 1)) {
  console.log("Запуск успішний");
}

function download() {
  const file = fs.createWriteStream(config.get("pdfpatch"));
  const request = http.get(config.get("url"), function (response) {
    response.pipe(file);
  });
}

function download1 (){
  var request = require('request');
  var progress = require('request-progress');
  progress(request(config.get("url")), {
 })
 .on('error', function (err) {
    bot.telegram.sendMessage(460266962, "Download error");
 })
 .on('end', function () {
     console.log("finish function");
     setTimeout(sendTimetable, 10000);
 })
 .pipe(fs.createWriteStream(config.get("pdfpatch")));   
 }

function getChatID() {
  pool.query("SELECT ChatId FROM users", function (err, result) {
    global.data = result;
  });
}

function sendTimetable() {
  var number = data.length;
  if (TimetableSendToday == 1) {
    for (let i = 0; i < number; i++) {
 
      bot.telegram.sendDocument(
        data[i].ChatId,
        { source: "./file/zm.pdf" },
        {disable_notification: true,
         caption: "Зміни в розкладі📚" }
      );
      pool.query("UPDATE properties SET value=1 WHERE id=3");
      if ((debugging = 1)) {
        console.log("Розклад надіслано" + data[i].ChatId);
      }
    }
  } else {
    for (let i = 0; i < number; i++) {
      bot.telegram.sendDocument(
        data[i].ChatId,
        { source: "./file/zm.pdf" },
        { caption: "Новий розклад📚" }
      );
      pool.query("UPDATE properties SET value=1 WHERE id=3");
      if ((debugging = 1)) {
        console.log("Розклад надіслано");
      }
    }
  }
}

function CheckIFfileSize() {
  if ((debugging = 1)) {
    console.log("--------------------------------------");
    console.log("Старт");
  }
  var request1 = require("request");
  request1(
    {
      url: config.get("url"),
      method: "HEAD",
    },
    function (err, response, body) {
      var NewFileSizeReplace = response.headers["content-length"];
      pool.query(
        "UPDATE properties SET value = " + NewFileSizeReplace + " WHERE id=2"
      );
      if ((debugging = 1)) {
      }
    }
  );
}

var j = schedule.scheduleJob("9 9 9 * * *", function () {
  pool.query("UPDATE properties SET value=0 WHERE id=3");
  pool.query("UPDATE properties SET value = value + 1 WHERE id  = 4");
});

function IfFileSize() {
  if ((debugging = 1)) {
    console.log("Новий розмір " + NewFileSize);
    console.log("Старий розмір " + OldFileSize);
   console.log("Чи розклад був надісланий " + TimetableSendToday);
  }

  if (NewFileSize == undefined) {
  } else if (OldFileSize == undefined) {
  } else {
    if (NewFileSize != OldFileSize) {
      download1();
      if ((debugging = 1)) {
        console.log("Завантаження файла");
      }

      pool.query(
        "UPDATE properties SET value = " + NewFileSize + " WHERE id=1"
      );
    }
  }
}

function CheckNewFileSize(i) {
  setTimeout(() => {
    pool.query("SELECT value FROM properties WHERE id=2 LIMIT 1", function (
      err,
      rows
    ) {
      global.NewFileSize = rows[0].value;
    });

    pool.query("SELECT value FROM properties WHERE id=1 LIMIT 1", function (
      err,
      rows
    ) {
      global.OldFileSize = rows[0].value;
    });

    pool.query("SELECT value FROM properties WHERE id=3 LIMIT 1", function (
      err,
      rows
    ) {
      global.TimetableSendToday = rows[0].value;
    });

    setTimeout(CheckIFfileSize, 3000);
    setTimeout(getChatID, 8000);
    setTimeout(IfFileSize, 10000);

    CheckNewFileSize(++i);
  }, 60000);
}

CheckNewFileSize(0);

bot.launch();
