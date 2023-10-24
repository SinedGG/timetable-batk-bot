const fs = require("fs");

module.exports = (bot) => {
  const commandsPath = "./commands";
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".js"));

  for (const file of commandFiles) {
    const filePath = commandsPath + "/" + file;
    const command = require("." + filePath);
    bot.command(command.name, (...args) => command.execute(...args));
  }
};
