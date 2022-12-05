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
    console.log("error connecting:" + error.stack);
    return;
  }
  console.log("success");
});
app.get("/", (req, res) => {
  res.render("index.ejs");
});
app.get("/auctions", (req, res) => {
  res.render("auctions.ejs");
});
app.get("/auctions/:auctionId", (req, res) => {
  res.render("auction.ejs");
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
      res.render('admin/carlist.ejs',{data:results});
    }
  );
});

app.listen(9000);
