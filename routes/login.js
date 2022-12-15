const router = require('express').Router();
const mysql = require("mysql");
const db = require("./../database.js");
const connection = mysql.createConnection(db);

const passport = require("passport");
router.use(passport.initialize());
const LocalStrategy = require("passport-local").Strategy;
passport.use(new LocalStrategy(
  {
    usernameField: "mail_address",
    passwordField: "password"
  },
  (mail_address, password, done) => {
    const sql = `
      SELECT
        *
      FROM
        user
      WHERE
        mail_address = ?
    `;
    connection
      .query(sql, [mail_address], (error, results) => {
        if (error) {
          return done(error);
        }
        if (results.length === 0) {
          return done(null, false, { message: "Incorrect mail_address." });
        }
        const user = results[0];
        const bcrypt = require("bcrypt");
        if (bcrypt.compareSync(password, user.password)) {
          return done(null, user);
        } else {
          return done(null, false, { message: "Incorrect password." });
        }
      });
  }
));

router.get("/", (req, res) => {
  res.render("login.ejs");
});

router.post("/", passport.authenticate("local", {
  session: false,
  successRedirect: "/",
  failureRedirect: "/login"
}));


module.exports = router;