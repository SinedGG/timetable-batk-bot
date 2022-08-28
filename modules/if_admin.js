function main(cfg, id) {
  var admins = cfg.admins_chat_id;
  return new Promise((resolve) => {
    for (let index = 0; index < admins.length; index++) {
      if (admins.indexOf(id) !== -1) {
        resolve(true);
      } else {
        resolve(false);
      }
    }
  });
}

module.exports = main;
