module.exports = {
  name: "stats",
  async execute(ctx) {
    const getUserCount = require("../models/user").stats;
    const userCount = await getUserCount();
    const startDate = await require("../models/vars").get("start-date");
    var days = Math.ceil(
      (new Date().getTime() - new Date(startDate.value).getTime()) /
        1000 /
        60 /
        60 /
        24
    );
    ctx.reply(
      `Працює безперервно - ${days}  📈\nКористувачів підписано - ${userCount} 👨‍🎓`
    );
  },
};
