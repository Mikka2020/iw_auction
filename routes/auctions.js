const router = require('express').Router();
const mysql = require("mysql");
const db = require("./../database.js");
const connection = mysql.createConnection(db);
const passport = require("passport");
const session = require("express-session");
router.use(session({
  secret: "secret",
  resave: false,
  saveUninitialized: false
}));
router.use(passport.initialize());
router.use(passport.session());

router.get("/:id", (req, res) => {
  const values = [req.params.id];
  const isAuth = req.isAuthenticated();
  const sql = `
      SELECT
        exhibit.id AS exhibit_id,
        exhibit.start_time,
        exhibit.end_time,
        manufacturer.manufacture_name,
        car.model_year,
        car.grade,
        car.car_condition,
        bodytype.bodytype_name,
        car.number_passengers,
        car.repair_history,
        car.car_inspection_expiration_date,
        car.mileage,
        exhibit.lowest_winning_bid,
        MAX(bid.bid_price) AS bid_price,
        eventdate.event_date
      FROM
        exhibit
      JOIN car ON exhibit.car_id = car.id
      LEFT JOIN manufacturer ON car.manufacturer_id = manufacturer.id
      LEFT JOIN color ON car.color_id = color.id
      LEFT JOIN bodytype ON car.body_type_id = bodytype.id
      LEFT JOIN eventdate ON exhibit.eventdate_id = eventdate.id
      LEFT JOIN bid ON exhibit.id = bid.exhibit_id
      WHERE
        exhibit.eventdate_id = ?
      GROUP BY exhibit.id
      ORDER BY
        exhibit.created_at
      DESC
      ;
    `;
  connection.query(sql, values, (error, results) => {
    // ユーザー情報
    const user = req.session.passport ? req.session.passport.user : null;
    res.render("auctionList", {
      isAuth: isAuth,
      user: user,
      exhibits: results
    });
  });
});

router.get("/items/:auctionId", (req, res) => {//auctionId = car.id

  const auctionId = req.params.auctionId;

  const sql = `SELECT*FROM
  car
  JOIN
  manufacturer
  ON
  car.manufacturer_id = manufacturer.id
  JOIN
  color
  ON
  car.color_id = color.id
  JOIN
  bodytype
  ON
  car.body_type_id = bodytype.id
  JOIN
  exhibit
  ON
  car.id = exhibit.car_id
  JOIN
  bid
  ON
  car.id = bid.exhibit_id
  WHERE car.id =`
    + auctionId;
  connection.query(
    sql,
    (error, results) => {
      if (error) {
        console.log('error connecting:' + error.stack);
        res.status(400).send({ messsage: 'Error!' });
        return;
      }
      res.render("auctionItem.ejs", { values: results[0], auctionId: req.params.auctionId });
    }
  );
});

module.exports = router;