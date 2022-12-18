const router = require('express').Router();
const mysql = require("mysql");
const db = require("./../database.js");
const connection = mysql.createConnection(db);
const passport = require("passport");
const session = require("express-session");
const flash = require('connect-flash');
router.use(session({
  secret: "secret",
  resave: false,
  saveUninitialized: false
}));
router.use(flash());
router.use(passport.initialize());
router.use(passport.session());

const LocalStrategy = require("passport-local").Strategy;
passport.serializeUser((user, done) => {
  done(null, {
    id: user.id,
    mail_address: user.mail_address,
    user_name: user.user_name
  });
});
passport.deserializeUser((user, done) => {
  done(null, user);
});

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
  successRedirect: "/",
  failureRedirect: "/login",
  failureFlash: true,
  successFlash: true,
}));
module.exports = router;