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
  async function getOrders() {
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
    const result = await new Promise((resolve, reject) => {
      connection
        .query(sql, [req.session.passport.user.id], (err, result) => {
          if (err) throw err;
          resolve(result);
        }
        );
    });
    return result;
  }
  async function getUserInfo() {
    const sql = `
    SELECT
      *
    FROM
      user
    WHERE
      id = ?
    ;
    `;
    const result = await new Promise((resolve, reject) => {
      connection
        .query(sql, [req.session.passport.user.id], (err, result) => {
          if (err) throw err;
          resolve(result);
        });
    });
    return result;
  }
  // ordersとuserInfoが取得できたらレンダリング
  Promise.all([getOrders(), getUserInfo()]).then((values) => {
    const isAuth = req.isAuthenticated();
    const user = req.session.passport ? req.session.passport.user : null;
    console.log(values);
    res.render("mypage", { orders: values[0], userInfo: values[1], isAuth: isAuth, user: user });
  });
});

router.get("/orders", (req, res) => {
});

router.get("/notifications", (req, res) => {
  const isAuth = req.isAuthenticated();
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
      const user = req.session.passport ? req.session.passport.user : null;
      console.log(result);
      res.render("notification", { notifications: result, isAuth: isAuth, user: user });
    });
});
module.exports = router;