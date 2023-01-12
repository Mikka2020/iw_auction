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
  const isAuth = req.isAuthenticated();
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
    // ログイン情報
    const user = req.session.passport ? req.session.passport.user : null;
    res.render("index", {
      isAuth: isAuth,
      user: user,
      dateList: dateList
    });
  });
});

module.exports = router;