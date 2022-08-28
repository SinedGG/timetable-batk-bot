async function main(bot, db) {
  bot
    .hears("⚙️ Налаштування", async (ctx) => {
      var [user] = await db.query(
        `SELECT chat_id FROM users WHERE chat_id=${ctx.chat.id}`
      );
      if (user[0]) {
        ctx.telegram
          .sendMessage(ctx.chat.id, "🔧 Виберіть опцію", {
            reply_markup: {
              keyboard: [[{ text: "📅 Розклад" }, { text: "🔔 Сповіщення" }]],
              resize_keyboard: true,
            },
          })
          .catch((err) => {});
      } else {
        ctx
          .reply(
            "Ви не можете відкрити налаштування коли вас немає у базі даних. Для старту використайте /start"
          )
          .catch((err) => {});
      }
    })
    .hears("📈 Статистика", async (ctx) => {
      var [rows] = await db
        .query("SELECT chat_id FROM users")
        .catch((err) => {});
      var users_count = rows.length;
      var days = Math.ceil(
        (new Date().getTime() - new Date(bot.cfg.start_date).getTime()) /
          1000 /
          60 /
          60 /
          24
      );
      console.log(
        `[Command] Користувач ${ctx.message.chat.username} (${ctx.message.chat.id}) використав команду /stats`
      );
      ctx
        .reply(
          `Працює безперервно - ${days}  📈\nКористувачів підписано - ${users_count} 👨‍🎓`
        )
        .catch((err) => {});
    })
    .hears("📅 Розклад", (ctx) => {
      ctx.telegram
        .sendMessage(ctx.chat.id, "🔧 Виберіть опцію", {
          reply_markup: {
            keyboard: [
              [
                { text: "👨‍🎓 Вибір групи" },
                { text: "📅 Отримувати розклад-таблицю" },
              ],
            ],
            resize_keyboard: true,
          },
        })
        .catch((err) => {});
    })
    .hears("📅 Отримувати розклад-таблицю", async (ctx) => {
      try {
        await db.query(
          `UPDATE users SET group_type='table' WHERE chat_id=${ctx.chat.id}`
        );
        console.log(
          `[Group] Встановлено розклад-таблицю для користувача ${ctx.message.chat.username} (${ctx.message.chat.id})`
        );
        ctx.telegram
          .sendMessage(
            ctx.chat.id,
            "Тепер ви будете отримувати розклад-таблицю 📅",
            {
              reply_markup: { remove_keyboard: true },
            }
          )
          .catch((err) => {});
      } catch (error) {
        ctx.telegram
          .sendMessage(ctx.chat.id, "Упс.. Сталась помилка 😰")
          .catch((err) => {});
        console.log(
          `[DB Error] Помилка оновлення групи для користувача ${ctx.message.chat.username} (${ctx.message.chat.id})`
        );
      }
    })
    .hears("👨‍🎓 Вибір групи", async (ctx) => {
      var [groups] = await db.query(`SELECT course FROM timetable_xls`);
      var keyboard = [];
      groups.forEach((group) => {
        keyboard.push([
          {
            text: group.course,
            callback_data: group.course,
          },
        ]);
      });
      ctx.telegram
        .sendMessage(ctx.chat.id, "👨‍🎓 Виберіть групу з списку:", {
          parse_mode: "markdown",
          reply_markup: {
            inline_keyboard: keyboard,
          },
        })
        .catch((err) => {});
    })
    .hears("🔔 Сповіщення", async (ctx) => {
      var [setting] = await db.query(
        `SELECT notification_n, notification_z, download_file FROM users WHERE chat_id=${ctx.chat.id}`
      );

      var set1 = "❌",
        set2 = "❌",
        set3 = "❌";

      if (setting[0].notification_n) set1 = "✔️";
      if (setting[0].notification_z) set2 = "✔️";
      if (setting[0].download_file) set3 = "✔️";

      ctx.telegram
        .sendMessage(ctx.chat.id, "⚙️*Налаштування сповіщень*", {
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
              [
                {
                  text: "Завантажувати файл - " + set3,
                  callback_data: "DF",
                },
              ],
            ],
          },
        })
        .catch((err) => {});
    });

  bot.on("callback_query", async (ctx) => {
    if (ctx.callbackQuery.data == "NN") {
      var [setting] = await db.query(
        `SELECT notification_n, notification_z, download_file FROM users WHERE chat_id=${ctx.chat.id}`
      );
      var value = 1;
      if (setting[0].notification_n) value = 0;

      db.query(
        `UPDATE users Set notification_n=${value} WHERE chat_id=${ctx.chat.id}`
      );
      EditInline(
        ctx,
        value,
        setting[0].notification_z,
        setting[0].download_file
      );
      var log_text = "вимкнуто";
      if (value) log_text = "увімкнено";
      console.log(
        `[Notification] Cповіщення нового розкладу ${log_text} для користувача ${ctx.chat.username} (${ctx.chat.id})`
      );
    } else if (ctx.callbackQuery.data == "NZ") {
      var [setting] = await db.query(
        `SELECT notification_n, notification_z, download_file FROM users WHERE chat_id=${ctx.chat.id}`
      );
      var value = 1;
      if (setting[0].notification_z) value = 0;

      db.query(
        `UPDATE users Set notification_z=${value} WHERE chat_id=${ctx.chat.id}`
      );
      EditInline(
        ctx,
        setting[0].notification_n,
        value,
        setting[0].download_file
      );
      var log_text = "вимкнуто";
      if (value) log_text = "увімкнено";
      console.log(
        `[Notification] Cповіщення змін в розкладі ${log_text} для користувача ${ctx.chat.username} (${ctx.chat.id})`
      );
    } else if (ctx.callbackQuery.data == "DF") {
      var [[{ group_type }]] = await db.query(
        `SELECT group_type FROM users WHERE chat_id=${ctx.chat.id}`
      );
      if (group_type == "table") {
        console.log("nope");
        return ctx
          .reply(
            `Ви не можете змінити дану опцію використовуючи розклалд-таблицю.`
          )
          .catch((err) => {});
      }
      var [setting] = await db.query(
        `SELECT notification_n, notification_z, download_file FROM users WHERE chat_id=${ctx.chat.id}`
      );
      var value = 1;
      if (setting[0].download_file) value = 0;

      db.query(
        `UPDATE users Set download_file=${value} WHERE chat_id=${ctx.chat.id}`
      );
      EditInline(
        ctx,
        setting[0].notification_n,
        setting[0].notification_z,
        value
      );
      var log_text = "вимкнуто";
      if (value) log_text = "увімкнено";
      console.log(
        `[Notification] Завантаження файлу ${log_text} для користувача ${ctx.chat.username} (${ctx.chat.id})`
      );
    } else {
      var [groups] = await db.query(`SELECT course FROM timetable_xls`);

      groups.forEach((group) => {
        if (ctx.callbackQuery.data == group.course) {
          db.query(
            `UPDATE users SET group_type='${ctx.callbackQuery.data}' WHERE chat_id=${ctx.chat.id}`
          );
          console.log(
            `[Group] Встановлено групу ${ctx.callbackQuery.data} для користувача ${ctx.chat.id}`
          );
          ctx
            .editMessageText("⚙️ Налаштування групи", {
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
            })
            .catch((err) => {});
        }
      });
    }
  });

  function EditInline(ctx, notification_n, notification_z, download_file) {
    var set1 = "❌",
      set2 = "❌",
      set3 = "❌";

    if (notification_n) set1 = "✔️";
    if (notification_z) set2 = "✔️";
    if (download_file) set3 = "✔️";

    ctx
      .editMessageText("⚙️*Налаштування сповіщень*", {
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
            [
              {
                text: "Завантажувати файл - " + set3,
                callback_data: "DF",
              },
            ],
          ],
        },
      })
      .catch((err) => {});
  }
}
module.exports = main;
