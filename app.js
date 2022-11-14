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

app.listen(9000);
