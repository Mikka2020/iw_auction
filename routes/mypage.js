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

router.get("/", (req, res) => {
  res.render("mypage");
});

router.get("/orders", (req, res) => {
  const sql = `
    SELECT
      successful_bid.id AS successful_bid_id,
      successful_bid.created_at AS successful_bid_created_at,
      car.id AS car_id,
      manufacturer.manufacture_name AS manufacturer_name,
      car.model_year,
      car.grade,
      car.model,
      successful_bid.successful_bid_price,
      successful_bid.payment_status
    FROM
    successful_bid
    JOIN exhibit ON successful_bid.exhibit_id = exhibit.id
    JOIN car ON car.id = exhibit.car_id
    JOIN manufacturer ON manufacturer.id = car.manufacturer_id
    WHERE
      successful_bid.user_id = ?
    ORDER BY
      successful_bid.created_at
    DESC;
    `;

  connection
    .query(sql, [req.session.passport.user.id], (err, result) => {
      if (err) throw err;
      res.render("orders", { orders: result });
    })
});
module.exports = router;