async function r(db) {
  return new Promise((resolve) => {
    db.query(
      `SELECT * FROM properties where type='last_days'`,
      (err, properties) => {
        if (err) {
          logger("DB Error", `change`, err);
        } else {
          resolve(properties[0].value);
        }
      }
    );
  });
}
module.exports = r;
