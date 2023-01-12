const router = require('express').Router();
const mysql = require("mysql");
const db = require("../../database.js");
const connection = mysql.createConnection(db);

router.get('/', (req, res) => {
  res.render('admin/index');
});

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
      exhibit AS e
    LEFT JOIN car AS c
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

router.get('/cars/register/', (req, res) => {
  res.render('admin/carRegister');
});

router.get('/cars/:id', (req, res) => {
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
      exhibit AS e
    LEFT JOIN car AS c
    ON
      e.car_id = c.id
    LEFT JOIN bodytype AS b
    ON
      c.body_type_id = b.id
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


module.exports = router;