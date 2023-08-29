require("dotenv").config();
const { Telegraf } = require("telegraf");
const bot = new Telegraf(process.env.TG_TOKEN);

require("./handler/command")(bot);
require("./handler/keyboard")(bot);

require("./modules/fileMonitor")(bot);

bot.launch();
