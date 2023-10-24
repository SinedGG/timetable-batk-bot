const fs = require("fs");

module.exports = (bot) => {
  const path = "./keyboard";
  const files = fs.readdirSync(path).filter((file) => file.endsWith(".js"));

  for (const file of files) {
    const filePath = path + "/" + file;
    const { execute } = require("." + filePath);
    execute(bot);
  }
};
