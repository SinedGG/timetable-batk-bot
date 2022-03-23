function r(db, content, current_day, file_size) {

  console.log("Очистка таблиці")

  var value = [];
  for (let index = 0; index < content.length; index++) {
    value.push([
      content[index].course,
      content[index].lesson1,
      content[index].classroom1,
      content[index].lesson2,
      content[index].classroom2,
      content[index].lesson3,
      content[index].classroom3,
      content[index].lesson4,
      content[index].classroom4,
      content[index].lesson5,
      content[index].classroom5,
    ]);
  }
  db.query("TRUNCATE table timetable", function (err) {
    if (err) {
        console.log("DB Error", `Помилка очистки таблиці timetable`, err);
    }
  });

  const db_request =
    "INSERT timetable (course, lesson1, classroom1, lesson2 ,classroom2, lesson3,classroom3, lesson4,classroom4, lesson5, classroom5) VALUES ?";

  db.query(db_request, [value], function (err) {
    if (err) {
      console.log("DB Error", `Помилка оновлення таблиці timetable`, err);
    } else {
    }
  });

  db.query(
    `update properties set value = "${current_day}" where type='last_days'`,
    function (err) {
      if (err) {
        console.log("DB Error", `Помилка зміни дня тижня у БД`, err);
      }
    }
  );

  db.query(
    `UPDATE properties SET value = ${file_size} WHERE type='OldFileSize'`,
    function (err) {
      if (err) {
        console.log(`[DB Error] Помилка оновлення розміру файлу!`, err);
      } else {
      }
    }
  );
}
module.exports = r;
