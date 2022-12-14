const router = require('express').Router();
const mysql = require("mysql");
const db = require("./../../database.js");
const connection = mysql.createConnection(db);

router.get('/cars', (req, res) => {
  connection.query(
    `SELECT
      e.start_time,
      e.end_time,
      c.car_model_name,
      b.bodytype_name,
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
      c.body_type_id = b.id`,
    (error, results) => {
      res.render('admin/carlist', { data: results });
    }
  );
});

module.exports = router;