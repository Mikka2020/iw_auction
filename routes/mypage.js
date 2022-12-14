const router = require('express').Router();
const mysql = require("mysql");
const db = require("./../database.js");
const connection = mysql.createConnection(db);

router.get("/", (req, res) => {
  res.render("mypage");
});

module.exports = router;