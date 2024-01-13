module.exports = {
  name: "zm",
  async execute(ctx) {
    console.log(
      `[Command] Користувач ${ctx.from.username} (${ctx.from.id}) використав команду /zm`
    );
    const download = await require("../modules/downloadFile")();
    ctx.replyWithDocument({ source: "./temp/zm.pdf" });
    console.log(`Файл завантажено. Час отримання - ${download.elapsedTime} ms`);
  },
};
