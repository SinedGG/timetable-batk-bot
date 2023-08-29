module.exports = {
  name: "start",
  async execute(ctx) {
    const create = require("../models/user").create;
    const { keyboard } = require("../keyboard/timetable");

    try {
      await create(
        ctx.from.id,
        ctx.from.username,
        ctx.from.first_name,
        ctx.from.last_name
      );
      console.log(
        `[Command] User ${ctx.from.username} (${ctx.from.id}) added to database.`
      );
      ctx.replyWithMarkdown(
        `* Виберіть опцію для надсилання розкладу: * \n \n
*👨‍🎓 Вибір групи* - отримувати розклад конкретної групи у текстовому форматі. \n
*📅 Отримувати розклад-таблицю* - отримувати розклад у форматі таблиці (_як на сайті_)`,
        keyboard
      );
    } catch (err) {
      if (err.code == "P2002") {
        ctx.reply("Здається ви вже є у базі даних.");
        console.log(
          `[Command] User ${ctx.from.username} (${ctx.from.id}) already exists in database.`
        );
      } else console.log(err);
    }
  },
};
