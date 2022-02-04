const fs = require("fs");
const cfg = JSON.parse(fs.readFileSync("./config/main.json", "utf8"));

function r(bot, db) {
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
      db.query(
        `SELECT chat_id FROM users WHERE chat_id=${ctx.chat.id}`,
        (err, res) => {
          if (!res[0]) {
            ctx.reply("Ви не можете відкрити налаштування коли вас немає у базі даних. Для старту використайте /start");
          } else {
            ctx.telegram.sendMessage(ctx.chat.id, "🔧 Виберіть опцію", {
              reply_markup: {
                keyboard: [[{ text: "📅 Розклад" }, { text: "🔔 Сповіщення" }]],
                resize_keyboard: true,
              },
            });
          }
        }
      );
    })
    .hears("📈 Статистика", (ctx) => {
      db.query("SELECT chat_id FROM users", function (err, result) {
        var user = result;
        db.query(
          "SELECT value FROM properties WHERE id=4",
          function (err, result) {
            ctx.reply(
              "Працює безперервно - " +
                result[0].value +
                "  📈" +
                "\n" +
                "Користувачів підписано - " +
                user.length +
                " 👨‍🎓",
              {
                reply_markup: { remove_keyboard: true },
              }
            );
          }
        );
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
            console.log(
              "DB Error",
              `Помилка оновлення групи для користувача ${ctx.chat.id}`,
              err
            );
          } else {
            console.log(
              "Group",
              `Встановлено розклад-таблицю для користувача ${ctx.chat.id}`,
              err
            );
            ctx.telegram.sendMessage(
              ctx.chat.id,
              "Тепер ви будете отримувати розклад-таблицю 📅",
              {
                reply_markup: { remove_keyboard: true },
              }
            );
          }
        }
      );
    })
    .hears("👨‍🎓 Вибір групи", (ctx) => {
      ctx.telegram
        .sendMessage(ctx.chat.id, "Вибір групи", {
          parse_mode: "markdown",
          reply_markup: {
            remove_keyboard: true,
          },
        })
        .then(({ message_id }) => {
          ctx.telegram.deleteMessage(ctx.chat.id, message_id);
        });
      select_group(ctx);
    });

  function select_group(ctx) {
    db.query(`SELECT course FROM timetable`, function (err, groups) {
      if (err) {
        console.log("DB Error", `Помилка отримання даних з БД`, err);
      } else {
        var keyboard = [];
        for (let index = 0; index < groups.length; index++) {
          keyboard.push([
            {
              text: groups[index].course,
              callback_data: groups[index].course,
            },
          ]);
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

  bot.on("callback_query", (ctx) => {
    if (ctx.callbackQuery.data == "NN") {
      db.query(
        `SELECT notification_n, notification_z FROM users WHERE chat_id=${ctx.chat.id}`,
        function (err, setting) {
          if (err) {
            console.log(
              "DB Error",
              `помилка отримання notification_n, notification_z для крористувача ${ctx.chat.id}`,
              err
            );
          } else {
            if (setting[0].notification_n) {
              db.query(
                `UPDATE users Set notification_n=false WHERE chat_id=${ctx.chat.id}`,
                function (err) {
                  if (err) {
                    console.log(
                      "DB Error",
                      `помилка оновлення notification_n=false для крористувача ${ctx.chat.id}`,
                      err
                    );
                  } else {
                    set1 = "❌";
                    if (setting[0].notification_z) {
                      set2 = "✔️";
                    } else {
                      set2 = "❌";
                    }
                    EditInline(ctx, set1, set2);
                    console.log(
                      "Notification",
                      `Cповіщення нового розкладу вимкнуто для користувача ${ctx.chat.id}`,
                      err
                    );
                  }
                }
              );
            } else {
              db.query(
                `UPDATE users Set notification_n=true WHERE chat_id=${ctx.chat.id}`,
                function (err) {
                  if (err) {
                    console.log(
                      "DB Error",
                      `Помилка оновлення notification_n=true для крористувача ${ctx.chat.id}`,
                      err
                    );
                  } else {
                    set1 = "✔️";
                    if (setting[0].notification_z) {
                      set2 = "✔️";
                    } else {
                      set2 = "❌";
                    }
                    EditInline(ctx, set1, set2);
                    console.log(
                      "Notification",
                      `Cповіщення нового розкладу увімкнено для користувача ${ctx.chat.id}`,
                      err
                    );
                  }
                }
              );
            }
          }
        }
      );
    }
    if (ctx.callbackQuery.data == "NZ") {
      db.query(
        `SELECT notification_n, notification_z FROM users WHERE chat_id=${ctx.chat.id}`,
        function (err, setting) {
          if (err) {
            console.log(
              "DB Error",
              `помилка отримання notification_n, notification_z для крористувача ${ctx.chat.id}`,
              err
            );
          } else {
            if (setting[0].notification_z) {
              db.query(
                `UPDATE users Set notification_z=false WHERE chat_id=${ctx.chat.id}`,
                function (err) {
                  if (err) {
                    console.log(
                      "DB Error",
                      `помилка оновлення notification_z=false для крористувача ${ctx.chat.id}`,
                      err
                    );
                  } else {
                    set2 = "❌";
                    if (setting[0].notification_n) {
                      set1 = "✔️";
                    } else {
                      set1 = "❌";
                    }
                    EditInline(ctx, set1, set2);
                    console.log(
                      "Notification",
                      `Cповіщення змін в розкладі вимкнуто для користувача ${ctx.chat.id}`,
                      err
                    );
                  }
                }
              );
            } else {
              db.query(
                `UPDATE users Set notification_z=true WHERE chat_id=${ctx.chat.id}`,
                function (err) {
                  if (err) {
                    console.log(
                      "DB Error",
                      `помилка оновлення notification_z=false для крористувача ${ctx.chat.id}`,
                      err
                    );
                  } else {
                    set2 = "✔️";
                    if (setting[0].notification_n) {
                      set1 = "✔️";
                    } else {
                      set1 = "❌";
                    }
                    EditInline(ctx, set1, set2);
                    console.log(
                      "Notification",
                      `Cповіщення змін в розкладі увімкнено для користувача ${ctx.chat.id}`,
                      err
                    );
                  }
                }
              );
            }
          }
        }
      );
    } else {
      db.query(`SELECT course FROM timetable`, function (err, groups) {
        if (err) {
          console.log("DB Error", `Помилка отримання даних з БД`, err);
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
                    console.log(
                      "DB Error",
                      `Помилка оновлення групи для користувача ${ctx.chat.id}`,
                      err
                    );
                  } else {
                    console.log(
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
          console.log(
            "DB Error",
            `помилка отримання notification_n, notification_z для крористувача ${ctx.chat.id}`,
            err
          );
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

          ctx.telegram
            .sendMessage(ctx.chat.id, "⚙️*Налаштування сповіщень*", {
              parse_mode: "markdown",
              reply_markup: {
                remove_keyboard: true,
              },
            })
            .then(({ message_id }) => {
              ctx.telegram.deleteMessage(ctx.chat.id, message_id);
            })
            .then(
              ctx.telegram.sendMessage(
                ctx.chat.id,
                "⚙️*Налаштування сповіщень*",
                {
                  parse_mode: "markdown",
                  reply_markup: {
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
                }
              )
            );
        }
      }
    );
  });

  function EditInline(ctx, set1, set2) {
    ctx.editMessageText("⚙️*Налаштування сповіщень*", {
      parse_mode: "markdown",
      reply_markup: {
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
    });
  }
}
module.exports = r;
