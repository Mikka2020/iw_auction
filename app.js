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
app.get("/", (req, res) => {
  res.render("index.ejs");
});
app.get("/auctions", (req, res) => {
  const sql = `
      SELECT
        exhibit.start_time,
        exhibit.endtime_time,
        manufacturer.manufacture_name,
        car.model_year,
        bodytype.bodytype_name,
        car.number_passengers,
        car.repair_history,
        car.car_inspection_expiration_date,
        car.mileage,
        exhibit.lowest_winning_bid,
        MAX(bid.bid_price) AS bid_price
      FROM
        exhibit
      JOIN car ON exhibit.car_id = car.id
      LEFT JOIN manufacturer ON car.manufacturer_id = manufacturer.id
      LEFT JOIN color ON car.color_id = color.id
      LEFT JOIN bodytype ON car.body_type_id = bodytype.id
      LEFT JOIN eventdate ON exhibit.eventdate_id = eventdate.id
      LEFT JOIN bid ON exhibit.id = bid.exhibit_id
      GROUP BY exhibit.id
      ORDER BY
        exhibit.created_at
      DESC
      ;
    `;
  connection.query(sql, (error, results) => {
    res.render("auctionList.ejs", { exhibits: results });
  });
});
app.get("/auctions/:auctionId", (req, res) => {//auctionId = car.id

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
      if(error) {
        console.log('error connecting:' + error.stack);
        res.status(400).send({ messsage: 'Error!'});
        return;
      }
      res.render("auctionItem.ejs",{values:results[0]});
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

app.listen(9000);
