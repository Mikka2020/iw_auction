const router = require('express').Router();
const mysql = require("mysql");
const db = require("../../database.js");
const connection = mysql.createConnection(db);

// 管理者トップ
router.get('/', (req, res) => {
  res.render('admin/index');
});

// イベント一覧
router.get('/events', (req, res) => {
  const sql = `
    SELECT
      eventdate.id,
      eventdate.event_date
    FROM
      eventdate
    ORDER BY
      eventdate.event_date
    DESC`;
  connection.query(
    sql,
    (error, results) => {
      res.render('admin/eventlist', { data: results });
    }
  );
});

// イベント登録
router.post('/events', (req, res) => {
  const sql = `
    INSERT INTO
      eventdate (event_date)
    VALUES
      (?)`;
  connection.query(
    sql,
    [req.body.event_date],
    (error, results) => {
      res.redirect('/admin/events');
    }
  );
});

// 車両一覧
router.get('/cars', (req, res) => {
  const sql = `
    SELECT
      e.start_time,
      e.end_time,
      c.car_model_name,
      b.bodytype_name,
      c.id AS car_id,
      c.mileage_situation,
      c.number_passengers,
      c.repair_history,
      c.car_inspection_expiration_date,
      c.mileage,
      e.lowest_winning_bid
    FROM
      car AS c
    LEFT JOIN exhibit AS e
    ON
      e.car_id = c.id
    LEFT JOIN bodytype AS b
    ON
      c.body_type_id = b.id
      `;
  connection.query(
    sql,
    (error, results) => {
      res.render('admin/carlist', { data: results });
    }
  );
});

// 車両登録
router.get('/cars/register/', (req, res) => {
  // メーカー一覧
  const sql = `
    SELECT
      id,
      manufacture_name
    FROM
      manufacturer
  `;
  connection.query(
    sql,
    (error, results) => {
      res.render('admin/carRegister', { manufacturerList: results });
    }
  );
});
// 車両詳細
router.get('/cars/:id/', (req, res) => {
  const sql = `
    SELECT
      e.start_time,
      e.end_time,
      c.car_model_name,
      b.bodytype_name,
      c.id AS car_id,
      c.mileage_situation,
      c.number_passengers,
      c.repair_history,
      c.car_inspection_expiration_date,
      c.mileage,
      e.lowest_winning_bid
    FROM
      car AS c
    LEFT JOIN exhibit AS e
    ON
      e.car_id = c.id
    LEFT JOIN bodytype AS b
    ON
      c.body_type_id = b.id
    WHERE
      c.id = ?
      `;
  async function getCarItem() {
    const carItem = await new Promise((resolve, reject) => {
      connection.query(
        sql,
        [req.params.id],
        (error, results) => {
          resolve(results[0]);
        }
      );
    });
    return carItem;
  }
  async function getEventDateList() {
    const eventDateList = await new Promise((resolve, reject) => {
      const sql = `
        SELECT
          eventdate.id,
          eventdate.event_date
        FROM
          eventdate
        WHERE
          event_date >= CURDATE()
        ORDER BY
          eventdate.event_date
        DESC`;
      connection.query(
        sql,
        (error, results) => {
          resolve(results);
        }
      );
    });
    return eventDateList;
  }
  Promise.all([getCarItem(), getEventDateList()]).then((results) => {
    res.render('admin/carItem', { data: results[0], eventDateList: results[1] });
  });
});

// 車両出品
router.get('/cars/:id/register', (req, res) => {
  const sql = `
    SELECT
      e.start_time,
      e.end_time,
      c.car_model_name,
      b.bodytype_name,
      c.id AS car_id,
      c.mileage_situation,
      c.number_passengers,
      c.repair_history,
      c.car_inspection_expiration_date,
      c.mileage,
      e.lowest_winning_bid
    FROM
      car AS c
    LEFT JOIN  exhibit AS e
    ON
      e.car_id = c.id
    LEFT JOIN bodytype AS b
    ON
      c.body_type_id = b.id
    WHERE
      c.id = ?
      `;
  async function getCarItem() {
    const carItem = await new Promise((resolve, reject) => {
      connection.query(
        sql,
        [req.params.id],
        (error, results) => {
          resolve(results[0]);
        }
      );
    });
    return carItem;
  }
  async function getEventDateList() {
    const eventDateList = await new Promise((resolve, reject) => {
      const sql = `
        SELECT
          eventdate.id,
          eventdate.event_date
        FROM
          eventdate
        WHERE
          event_date >= CURDATE()
        ORDER BY
          eventdate.event_date
        DESC`;
      connection.query(
        sql,
        (error, results) => {
          resolve(results);
        }
      );
    });
    return eventDateList;
  }
  Promise.all([getCarItem(), getEventDateList()]).then((results) => {
    res.render('admin/carExhibit', { data: results[0], eventDateList: results[1] });
  });
});

// 車両出品
router.post('/cars/:id/register', (req, res) => {
  // const sql = `
  //   INSERT INTO
  //     exhibit
  //   SET
  //     car_id = ?,
  //     event_date_id = ?,
  //     start_time = ?,
  //     end_time = ?,
  //     lowest_winning_bid = ?
  // `;
  async function getEventDate() {
    const eventDate = await new Promise((resolve, reject) => {
      const sql = `
        SELECT
          event_date
        FROM
          eventdate
        WHERE
          id = ?
      `;
      connection.query(
        sql,
        [req.body.event_date_id],
        (error, results) => {
          resolve(results[0]);
        }
      );
    });
    return eventDate;
  }
  async function insertExhibit(eventDate) {
    const sql = `
      INSERT INTO
        exhibit
        (car_id, eventdate_id, start_time, end_time, lowest_winning_bid)
      VALUES
        (?, ?, ?, ?, ?)
      ;
    `;
    const start_time = new Date(eventDate.event_date.toLocaleDateString() + ' ' + req.body.start_time);
    const end_time = new Date(eventDate.event_date.toLocaleDateString() + ' ' + req.body.end_time);
    const values = [
      req.params.id,
      req.body.event_date_id,
      start_time,
      end_time,
      req.body.lowest_winning_bid
    ];
    console.log(eventDate);
    connection.query(
      sql,
      values,
      (error, results) => {
        console.log(values);
        res.redirect('/admin/cars');
      }
    );
  }

  Promise.all([getEventDate()]).then((results) => {
    insertExhibit(results[0]);
  }
  );
});


module.exports = router;