module.exports = async (bot, isTableChanged, caption, table) => {
  const { table: tableOld } = await require("../models/timetable").getLast();

  return new Promise(async (resolve, reject) => {
    for (let i = 0; i < table.length; i++) {
      const oldRow = tableOld.find((obj) => obj.group == table[i].group);
      if (JSON.stringify(table[i]) != JSON.stringify(oldRow)) {
        var captionNew = caption;
        captionNew += `\nДля групи: ${table[i].group}\n`;
        table[i].lessons.forEach((el) => {
          captionNew += `\n${el.subject} [${el.cabinet}] ${el.teacher}`;
        });
        console.log(captionNew.replace(/\n/g, " | "));

        await require("./sendMessage")(
          bot,
          isTableChanged,
          captionNew,
          table[i].group
        );
      }
    }
    resolve();
  });
};
