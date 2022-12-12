"use strict";
const express = require("express");
const app = express();
const http = require("http").Server(app);

app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public", { index: false }));
app.use(express.static(__dirname + "/views", { index: false }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// DB接続
const mysql = require("mysql");
// constファイルからDB接続情報を取得
const db = require("./database.js");
const connection = mysql.createConnection(db);

connection.connect((error) => {
  if (error) {
    return;
  }
  console.log("success");
});

const passport = require("passport");
app.use(passport.initialize());

const LocalStrategy = require("passport-local").Strategy;
passport.use(
  new LocalStrategy(
    { usernameField: "email", passwordField: "password" },
    (email, password, done) => {
      const values = [email, password];
      connection.query(
        "SELECT * FROM user WHERE mail_address = ? AND password = ?",
        values,
        (err, results) => {
          if (err) {
            return done(err);
          }
          if (results.length === 0) {
            return done(null, false);
          }
          return done(null, results[0]);
        }
      );
    }
  )
);

app.get("/", (req, res) => {
  const sql = `
    SELECT
      eventdate.id,
      eventdate.event_date
    FROM
      eventdate
    ORDER BY
      eventdate.event_date
    DESC;
  `;
  connection.query(sql, (error, results) => {
    if (error) {
      console.log("error connecting:" + error.stack);
      res.status(400).send({ messsage: "Error!" });
      return;
    }
    // 年月は降順、日付は昇順にソートする。
    const dateList = results.reduce((acc, cur) => {
      const yearMonth = cur.event_date.toISOString().slice(0, 7);
      if (acc[yearMonth]) {
        acc[yearMonth].push(cur);
      } else {
        acc[yearMonth] = [cur];
      }
      return acc;
    }, {});
    Object.keys(dateList).forEach((key) => {
      dateList[key].sort((a, b) => {
        return a.event_date - b.event_date;
      });
    });
    res.render("index.ejs", { dateList: dateList });
  });
});
app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/auctions/:id", (req, res) => {
  const values = [req.params.id];
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
  connection.query(sql,
    values,
    (error, results) => {
      res.render("auctionList.ejs", { exhibits: results });
    }
  );
});

app.get("/auctions/:id", (req, res) => {
  const values = [req.params.id];
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
    res.render("auctionList", { exhibits: results });
  });
});

app.get("/auctions/items/:auctionId", (req, res) => {//auctionId = car.id

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
  car.id = exhibit.vehicle_id
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
      res.render("auctionItem.ejs", { values: results[0] });
    }
  );
});
app.get("/register", (req, res) => {
  res.render("register.ejs");
});
app.get("/login", (req, res) => {
  res.render("login.ejs");
});
app.get("/mypage", (req, res) => {
  res.render("mypage.ejs");
});

//マスタ
//車両一覧取得
app.get('/admin/cars', (req, res) => {
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
      res.render('admin/carlist.ejs', { data: results });
    }
  );
});

app.listen(9000);