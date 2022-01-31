function r(db, user){
    db.query(
        `DELETE FROM users WHERE chat_id =${user}`,
        function (err) {
          if (err) {
            console.log(
              `[DB Error] Помилка видалення користувача ${user} з бази даних!`,
              err
            );
          } else {
            console.log(
              `[DB] Користувача ${user} видалено з бази даних у зв'язку з блокуванням`
            );
          }
        }
      );
}
module.exports = r;