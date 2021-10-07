const { Telegraf } = require("telegraf");
require("dotenv").config();
const bot = new Telegraf(process.env.TG_TOKEN);
const http = require("http");
const fs = require("fs");
var mysql = require("mysql");
var schedule = require("node-schedule");
var request = require("request");
const { triggerAsyncId } = require("async_hooks");
const { consumers } = require("stream");


const db = mysql.createPool({
  connectionLimit: 5,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
});

var cfg = JSON.parse(fs.readFileSync("./config/main.json", "utf8"));
var text = JSON.parse(fs.readFileSync("./config/text.json", "utf8"));

function logger(type, text, err) {
  var moment = require("moment-timezone");

  var log_text = `[${moment()
    .tz("Europe/Kiev")
    .format("YYYY-MM-DD HH:mm:ss")}] [${type}] - ${text}`;
  var logtofile = fs.createWriteStream("log/last.txt", {
    flags: "a",
  });

  if (err == undefined) {
    err = "";
  }
  console.log(log_text + "  " + err);

  logtofile.write(log_text + "\r\n");
  bot.telegram.sendMessage(cfg.log_channel, log_text);
}

var markdown = {
  "parse_mode": "markdown"
};


bot.start((ctx) => {
  db.query(
    `INSERT users (chat_id) values (${ctx.message.chat.id})`,
    function (err) {
      if (err) {
        logger(
          "DB Error",
          `Помилка додавання користувача ${ctx.message.chat.id} до бази даних!`,
          err
        );
        if (err.code == "ER_DUP_ENTRY") {
          logger(
            "User",
            `Користувач ${ctx.message.chat.id} вже є у базі даних`
          );
          ctx.reply(text.user_already_exist);
        }
      } else {
        logger(
          "DB",
          `Користувача ${ctx.message.chat.id} додано до бази даних!`
        );
        ctx.telegram.sendMessage(ctx.chat.id, text.start,{
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
        logger(
          "DB Error",
          `Помилка видалення користувача ${ctx.message.chat.id} з бази даних!`,
          err
        );
      } else {
        logger(
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
});

bot.command("help", (ctx) => {
  ctx.reply("Для питань і пропозицій @berezovsky23");
});

bot.command("version", (ctx) => {
  ctx.reply("Vesion: " + cfg.version);
});

bot.command("getlog", (ctx) => {
  if(ctx.message.chat.id == "460266962"){
  bot.telegram.sendDocument(
      ctx.message.chat.id,
      { source: "./log/last.txt" },
      {disable_notification: true,
       caption: "Last log" }
    ).catch(err =>{
      if(err.message == '400: Bad Request: file must be non-empty'){
          ctx.reply("Log file is empty!"); 
      }
    })
  }
});

bot.command("zm", ctx =>{
  ctx.replyWithDocument(            
    { source: cfg.pdfpatch },
    { disable_notification: true, caption: "" })
})

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

bot.command("updatemsg", (ctx) => {

  if(ctx.message.chat.id == "460266962"){
      db.query("SELECT chat_id FROM users", function (err, result) {
        for(var i = 0; i<result.length; i++){
          bot.telegram.sendMessage(result[i].chat_id, 
            " * Нове оновлення ✨ * \n\n Додано: \n - керування сповіщеннями. \n /menu ➾ ⚙️ Налаштування ➾ 🔔 Сповіщення \n\n - маршрутизація розкладу (вибір конкретної групи для отримання розкладу, або отримання розклад-таблиці(як на сайті)) \n /menu ➾ ⚙️ Налаштування ➾ 📅 Розклад \n\n _*при знаходженні недопрацювання, багів, одруківок будь ласка сповістіть в /report _",
            markdown
            );

        }
      });
    }
});

bot.command("report", (ctx) => {
  ctx.reply("Для зв'язку з розробником -  @berezovsky23");
});

function GetNewFileSize() {
  request(
    {
      url: cfg.url,
      method: "HEAD",
    },
    function (err, response, body) {
      if (err) {
        logger("Request ERROR", `Неможливо отримати розмір файлу!`, err);
      } else {
        var file_size = response.headers["content-length"];
        if (!isNaN(file_size)) {
          CompareFileSize(file_size);
        }
      }
    }
  );
}

function CompareFileSize(NewSize) {
  db.query(
    `SELECT value FROM properties WHERE type='OldFileSize' `,
    function (err, rows) {
      if (err) {
        logger(
          "DB Error",
          `Помилка отримаання розміру файла з бази даних!`,
          err
        );
      } else {
        var oldSize = rows[0].value;
        console.log("New size = " + NewSize + " Old Size = " + oldSize);
        if (NewSize != oldSize) {
          download_file(NewSize);
        }
      }
    }
  );
}

function download_file(file_size) {
  var progress = require("request-progress");
  progress(request(cfg.url), {})
    .on("error", function (err) {
      logger("Download ERROR", `Помилка завантаження файлу`, err);
    })
    .on("end", function () {
      logger("Download", `Файл заавантажено успішно`);
      ReplaceFileSize(file_size);
    })
    .pipe(fs.createWriteStream(cfg.pdfpatch));
}

function ReplaceFileSize(size) {
  db.query(
    `UPDATE properties SET value = ${size} WHERE type='OldFileSize'`,
    function (err) {
      if (err) {
        logger("DB Error", `Помилка оновлення розміру файлу!`, err);
      } else {
        GetTimetableDay();
        //do someting
      }
    }
  );
}

function GetTimetableDay() {
  const pdf = require("pdf-parse");

  var days = ["понеділок", "вівторок", "середу", "четвер", "п'ятницю", "суботу"];
  var day;
  let dataBuffer = fs.readFileSync(cfg.pdfpatch);

  pdf(dataBuffer).then(function (data) {
    for (let index = 0; index < days.length; index++) {
      if (data.text.indexOf(days[index]) != -1) {
        day = days[index];
        break;
      }
    }
    if (day != undefined) {
      db.query(
        `UPDATE properties SET value="${day}" WHERE type='last_day'`,
        function (err) {
          if (err) {
            logger("DB Error", `Помилка оновлення дня тижня!`, err);
          }
          var content = {
            course: "table",
          };
          sendTimetable(content, day);
          parcePDF(day)
        }
      );
    }else{
      sendTimetable({course: "table"}, "");
          parcePDF("")
    }
  });
}

function parcePDF(day) {
  var pdf_table_extractor = require("pdf-table-extractor");

  function success(result) {
    var table = result.pageTables[0].tables;

    var value = [];

    for (var i = 0; i < table.length; i++) {
      var course = table[i][0].replace(/\s+/g, "").trim();
      var lesson1 = table[i][1].replace(/\s+/g, " ").trim();
      var classroom1 = table[i][2].replace(/\s+/g, " ").trim();
      var lesson2 = table[i][3].replace(/\s+/g, " ").trim();
      var classroom2 = table[i][4].replace(/\s+/g, " ").trim();
      var lesson3 = table[i][5].replace(/\s+/g, " ").trim();
      var classroom3 = table[i][6].replace(/\s+/g, " ").trim();
      var lesson4 = table[i][7].replace(/\s+/g, " ").trim();
      var classroom4 = table[i][8].replace(/\s+/g, " ").trim();
      var lesson5 = table[i][9];
      var classroom5 = table[i][10];

      for (var k = 1; k < classroom1.length; k++) {
        var letter = classroom1.slice(k, k + 1);
        if (isNaN(letter)) {
          if (letter === letter.toUpperCase()) {
            if (classroom1.slice(k - 1, k) == " ") {
              lesson2 = classroom1.slice(k, classroom1.length);
              classroom1 = classroom1.slice(0, k);
            }
          }
        }
      }

      for (var k = 1; k < classroom2.length; k++) {
        var letter = classroom2.slice(k, k + 1);
        if (isNaN(letter)) {
          if (letter === letter.toUpperCase()) {
            if (classroom2.slice(k - 1, k) == " ") {
              lesson3 = classroom2.slice(k, classroom2.length);
              classroom2 = classroom2.slice(0, k);
            }
          }
        }
      }

      for (var k = 1; k < classroom3.length; k++) {
        var letter = classroom3.slice(k, k + 1);
        if (isNaN(letter)) {
          if (letter === letter.toUpperCase()) {
            if (classroom3.slice(k - 1, k) == " ") {
              lesson4 = classroom3.slice(k, classroom3.length);
              classroom3 = classroom3.slice(0, k);
            }
          }
        }
      }
      value.push([
        course,
        lesson1,
        classroom1,
        lesson2,
        classroom2,
        lesson3,
        classroom3,
        lesson4,
        classroom4,
        lesson5,
        classroom5,
      ]);
    }
    for (let index = 0; index < value.length; index++) {
      if (value[index][0] === "") {
        value.splice(index, 1);
      }
    }
    for (let index = 0; index < value.length; index++) {
      if (value[index][0] === "Група") {
        value.splice(index, 1);
      }
    }

    db.query("TRUNCATE table timetable", function (err) {
      if (err) {
        logger("DB Error", `Помилка очистки таблиці timetable`, err);
      }
    });

    const db_request =
      "INSERT timetable (course, lesson1, classroom1, lesson2 ,classroom2, lesson3,classroom3, lesson4,classroom4, lesson5, classroom5) VALUES ?";
    db.query(db_request, [value], function (err) {
      if (err) {
        logger("DB Error", `Помилка оновлення таблиці timetable`, err);
      } else {
        setTimeout(() => {
          SeparateTable(day)
        }, 2500);
        
      }
    });
  }

  function error(err) {
    logger("Parce ERROR", `Помилка парсингу pdf файлу`, err);
  }

  pdf_table_extractor(cfg.pdfpatch, success, error);
}

function SeparateTable(current_day) {
  db.query(`SELECT * FROM timetable_old`, function (err, rowsold) {
    if (err) {
      logger("DB Error", `Помилка отримання даних з бази даних!`, err);
    } else {
      for (let index = 0; index < rowsold.length; index++) {
        db.query(
          `SELECT * FROM timetable WHERE course='${rowsold[index].course}'`,
          function (err, rows) {
            if (err) {
              logger("DB Error", `Помилка отримання даних з бази даних!`, err);
            } else {
              if (
                rowsold[index].lesson1 != rows[0].lesson1 ||
                rowsold[index].lesson2 != rows[0].lesson2 ||
                rowsold[index].lesson3 != rows[0].lesson3 ||
                rowsold[index].lesson4 != rows[0].lesson4 ||
                rowsold[index].lesson5 != rows[0].lesson5 ||
                rowsold[index].classroom1 != rows[0].classroom1 ||
                rowsold[index].classroom2 != rows[0].classroom2 ||
                rowsold[index].classroom3 != rows[0].classroom3 ||
                rowsold[index].classroom4 != rows[0].classroom4 ||
                rowsold[index].classroom5 != rows[0].classroom5
              ) {
                setTimeout(() => {
                  sendTimetable(rows[0], current_day);
                }, 2500);
              }
            }
          }
        );
      }
    }
  });
  setTimeout(() => {
    clone_table(current_day);
  }, 25000);
}

function sendTimetable(content, current_day) {
  db.query(
    `SELECT * FROM users WHERE group_type='${content.course}'`,
    function (err, users) {
      if (err) {
        logger(
          "DB Error",
          `Помилка отримання користувачів групи ${content.course} даних з бази даних!`,
          err
        );
      }
      if (users.length == 0) {
      } else {
        var pass = true;
        for (let i = 0; i < users.length; i++) {

        db.query(
          `SELECT * FROM properties where type='last_days'`,
          function (err, properties) {
            if (err) {
              logger("DB Error", `change`, err);
            } else {
              var disable_notification = true;

              if (current_day != properties[0].value) {
                text = "Новий розклад📚";
                if (users[i].notification_n) {
                  disable_notification = false;
                }
              } else {
                text = "Зміни в розкладі📚";
                if (users[i].notification_z) {
                  disable_notification = false;
                }
              }
              if(content.course != 'table'){
              text = `${text}\nДля групи ${content.course} на ${current_day} \n\n${content.lesson1} [ ${content.classroom1} ]\n${content.lesson2} [ ${content.classroom2} ]\n${content.lesson3} [ ${content.classroom3} ]\n${content.lesson4} [ ${content.classroom4} ]`;
              }else{
                text = `${text} на ${current_day}`
              }
              bot.telegram.sendDocument(
                users[i].chat_id,
                { source: cfg.pdfpatch },
                { disable_notification: disable_notification, caption: text }
              );
              logger("Send table", `Надіслано" ${users[i].chat_id}  disable_notification - ${disable_notification}`, err);
              if(pass){
                debug_send_text(text);
                pass = false;
              }
            }
          }
        );
        }
      }
    }
  );
}

function debug_send_text(text){
  bot.telegram.sendDocument(
    cfg.log_channel,
    { source: cfg.pdfpatch },
    { disable_notification: true, caption: text }
  );
}

function clone_table(current_day){
  db.query(`update properties set value = "${current_day}" where type='last_days'`, function (err) {
    if (err) {
      logger("DB Error", `Помилка зміни дня тижня у БД`, err);
    }
  });
  db.query("TRUNCATE table timetable_old", function (err) {
    if (err) {
      logger("DB Error", `Помилка очистки таблиці timetable_old`, err);
    }
  });
  db.query("INSERT INTO timetable_old SELECT * FROM timetable", function (err) {
    if (err) {
      logger("DB Error", `Помилка очистки таблиці timetable`, err);
    }else{
      logger("DB", `Таблицю timetable клоновано`, err);
    }
  });
}

bot
  .command("menu", (ctx) => {
    ctx.telegram.sendMessage(ctx.chat.id, "Меню 📋", {
      reply_markup: {
        keyboard: [[{ text: "📈 Статистика" }, { text: "⚙️ Налаштування" }]],
        resize_keyboard: true,
      },
    });
  })
  .hears("⚙️ Налаштування", (ctx) => {
    ctx.telegram.sendMessage(ctx.chat.id, "🔧 Виберіть опцію", {
      reply_markup: {
        keyboard: [[{ text: "📅 Розклад" }, { text: "🔔 Сповіщення" }]],
        resize_keyboard: true,
      },
    });
  })
  .hears("📈 Статистика", (ctx) => {
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
            " 👨‍🎓",{
              reply_markup: { remove_keyboard: true },
            }
        );
      });
    });
  })
  .hears("📅 Розклад", (ctx) => {
    ctx.telegram.sendMessage(ctx.chat.id, "🔧 Виберіть опцію", {
      reply_markup: {
        keyboard: [
          [
            { text: "👨‍🎓 Вибір групи" },
            { text: "📅 Отримувати розклад-таблицю" },
          ],
        ],
        resize_keyboard: true,
      },
    });
  })
  .hears("📅 Отримувати розклад-таблицю", (ctx) => {
    db.query(
      `UPDATE users SET group_type='table' WHERE chat_id=${ctx.chat.id}`,
      function (err) {
        if (err) {
          ctx.telegram.sendMessage(ctx.chat.id, "Упс.. Сталась помилка 😰");
          logger(
            "DB Error",
            `Помилка оновлення групи для користувача ${ctx.chat.id}`,
            err
          );
        } else {
          logger("Group", `Встановлено розклад-таблицю для користувача ${ctx.chat.id}`, err);
          ctx.telegram.sendMessage(ctx.chat.id, text.table_timetable_confirm, {
            reply_markup: { remove_keyboard: true },
          });
        }
      }
    );
  })
  .hears("👨‍🎓 Вибір групи", (ctx) => {
    ctx.telegram.sendMessage(ctx.chat.id, "Вибір групи", {
      parse_mode: "markdown",
      reply_markup:{
        remove_keyboard: true,
      },
    }).then(({message_id})=>{
      ctx.telegram.deleteMessage(ctx.chat.id, message_id)
    });
    select_group(ctx)
  });

function select_group(ctx){
  
  db.query(`SELECT course FROM timetable`, function (err, groups) {
    if (err) {
      logger("DB Error", `Помилка отримання даних з БД`, err);
    }else{
      var keyboard = [];
      for (let index = 0; index < groups.length; index++) {
        keyboard.push([
          {
            text: groups[index].course,
            callback_data: groups[index].course,
          }
        ])
        
      }
      ctx.telegram.sendMessage(ctx.chat.id, "👨‍🎓 Виберіть групу з списку:", {
        parse_mode: "markdown",
        reply_markup: {
          inline_keyboard: keyboard,
        },
      });
    }
  });
  
}

bot.on('callback_query', (ctx) => {
  if(ctx.callbackQuery.data == "NN"){
    db.query(
      `SELECT notification_n, notification_z FROM users WHERE chat_id=${ctx.chat.id}`,
      function (err, setting) {
        if (err) {
          logger("DB Error", `помилка отримання notification_n, notification_z для крористувача ${ctx.chat.id}`, err);
        } else {
          if (setting[0].notification_n) {
            db.query(
              `UPDATE users Set notification_n=false WHERE chat_id=${ctx.chat.id}`,
              function (err) {
                if (err) {
                  logger("DB Error", `помилка оновлення notification_n=false для крористувача ${ctx.chat.id}`, err);
                } else {
                  set1 = "❌";
                  if (setting[0].notification_z) {
                    set2 = "✔️";
                  } else {
                    set2 = "❌";
                  }
                  EditInline(ctx, set1, set2);
                  logger("Notification", `Cповіщення нового розкладу вимкнуто для користувача ${ctx.chat.id}`, err);
                }
              }
            );
          } else {
            db.query(
              `UPDATE users Set notification_n=true WHERE chat_id=${ctx.chat.id}`,
              function (err) {
                if (err) {
                  logger("DB Error", `Помилка оновлення notification_n=true для крористувача ${ctx.chat.id}`, err);
                } else {
                  set1 = "✔️";
                  if (setting[0].notification_z) {
                    set2 = "✔️";
                  } else {
                    set2 = "❌";
                  }
                  EditInline(ctx, set1, set2);
                  logger("Notification", `Cповіщення нового розкладу увімкнено для користувача ${ctx.chat.id}`, err);
                }
              }
            );
          }
        }
      }
    );
  }if(ctx.callbackQuery.data == "NZ"){
    db.query(
      `SELECT notification_n, notification_z FROM users WHERE chat_id=${ctx.chat.id}`,
      function (err, setting) {
        if (err) {
          logger("DB Error", `помилка отримання notification_n, notification_z для крористувача ${ctx.chat.id}`, err);
        } else {
          if (setting[0].notification_z) {
            db.query(
              `UPDATE users Set notification_z=false WHERE chat_id=${ctx.chat.id}`,
              function (err) {
                if (err) {
                  logger("DB Error", `помилка оновлення notification_z=false для крористувача ${ctx.chat.id}`, err);
                } else {
                  set2 = "❌";
                  if (setting[0].notification_n) {
                    set1 = "✔️";
                  } else {
                    set1 = "❌";
                  }
                  EditInline(ctx, set1, set2);
                  logger("Notification", `Cповіщення змін в розкладі вимкнуто для користувача ${ctx.chat.id}`, err);
                }
              }
            );
          } else {
            db.query(
              `UPDATE users Set notification_z=true WHERE chat_id=${ctx.chat.id}`,
              function (err) {
                if (err) {
                  logger("DB Error", `помилка оновлення notification_z=false для крористувача ${ctx.chat.id}`, err);
                } else {
                  set2 = "✔️";
                  if (setting[0].notification_n) {
                    set1 = "✔️";
                  } else {
                    set1 = "❌";
                  }
                  EditInline(ctx, set1, set2);
                  logger("Notification", `Cповіщення змін в розкладі увімкнено для користувача ${ctx.chat.id}`, err);
                }
              }
            );
          }
        }
      }
    );
  }else{
  db.query(`SELECT course FROM timetable`, function (err, groups) {
    if (err) {
      logger("DB Error", `Помилка отримання даних з БД`, err);
    } else {
      for (let index = 0; index < groups.length; index++) {
        if (ctx.callbackQuery.data == groups[index].course) {
          db.query(
            `UPDATE users SET group_type='${ctx.callbackQuery.data}' WHERE chat_id=${ctx.chat.id}`,
            function (err) {
              if (err) {
                ctx.telegram.sendMessage(
                  ctx.chat.id,
                  "Упс.. Сталась помилка 😰"
                );
                logger(
                  "DB Error",
                  `Помилка оновлення групи для користувача ${ctx.chat.id}`,
                  err
                );
              } else {
                logger(
                  "Group",
                  `Встановлено групу ${ctx.callbackQuery.data} для користувача ${ctx.chat.id}`,
                  err
                );
                ctx.editMessageText("⚙️ Налаштування групи", {
                  parse_mode: "markdown",
                  reply_markup: {
                    inline_keyboard: [
                      [
                        {
                          text: "Вашу групу було оновлено ♻️",
                          callback_data: "group_updated",
                        },
                      ],
                    ],
                  },
                });
              }
            }
          );
        }
      }
    }
  });
}
});

var set1, set2;

bot.hears("🔔 Сповіщення", (ctx) => {
  db.query(
    `SELECT notification_n, notification_z FROM users WHERE chat_id=${ctx.chat.id}`,
    function (err, setting) {
      if (err) {
        logger("DB Error", `помилка отримання notification_n, notification_z для крористувача ${ctx.chat.id}`, err);
      } else {
        if (setting[0].notification_n) {
          set1 = "✔️";
        } else {
          set1 = "❌";
        }
        if (setting[0].notification_z) {
          set2 = "✔️";
        } else {
          set2 = "❌";
        }
        
        ctx.telegram.sendMessage(ctx.chat.id, text.notification_setting, {
          parse_mode: "markdown",
          reply_markup:{
            remove_keyboard: true,
          },
        }).then(({message_id})=>{
          ctx.telegram.deleteMessage(ctx.chat.id, message_id)
        }).then(
          ctx.telegram.sendMessage(ctx.chat.id, text.notification_setting, {
            parse_mode: "markdown",
            reply_markup:{
              inline_keyboard: [
                [
                  {
                    text: "Сповіщення нового розкладу - " + set1,
                    callback_data: "NN",
                  },
                ],
                [
                  {
                    text: "Сповіщення змін у розкладі - " + set2,
                    callback_data: "NZ",
                  },
                ],
              ],
            },
          })
        );
      }
    }
  );
});

bot.action("NN", (ctx) => {
  
});

function EditInline(ctx, set1, set2) {
  ctx.editMessageText(text.notification_setting, {
    parse_mode: "markdown",
    reply_markup: {
      inline_keyboard: [
        [{ text: "Сповіщення нового розкладу - " + set1, callback_data: "NN" }],
        [{ text: "Сповіщення змін у розкладі - " + set2, callback_data: "NZ" }],
      ],
    },
  });
}

bot.action("NZ", (ctx) => {
  
});

var j = schedule.scheduleJob("9 9 9 * * *", function () {
  db.query("UPDATE properties SET value=0 WHERE id=3");
  db.query("UPDATE properties SET value = value + 1 WHERE id  = 4");
});


main()
function main(){
  GetNewFileSize();
  setTimeout(() => {
    main()
  }, 5000);
}

bot.launch();