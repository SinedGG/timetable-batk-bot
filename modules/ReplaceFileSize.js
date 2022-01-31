function r(db, size) {
  db.query(
    `UPDATE properties SET value = ${size} WHERE type='OldFileSize'`,
    function (err) {
      if (err) {
        console.log(`[DB Error] Помилка оновлення розміру файлу!`, err);
      } else {
      }
    }
  );
}

module.exports = r;
