const router = require('express').Router();
const mysql = require("mysql");
const db = require("./../database.js");
const connection = mysql.createConnection(db);

router.get("/", (req, res) => {
  res.render("register.ejs");
});
router.post("/", (req, res) => {
  const bcrypt = require("bcrypt");
  const values = [
    req.body.mail_address,
    req.body.first_name,
    req.body.last_name,
    req.body.user_name,
    bcrypt.hashSync(req.body.password, 10),
    req.body.phone_number,
    req.body.address
  ];
  const sql = `
    INSERT INTO
      user
      (
        mail_address,
        first_name,
        last_name,
        user_name,
        password,
        phone_number,
        address
      )
    VALUES
      (?, ?, ?, ?, ?, ?, ?)
  `;
  connection.query(sql, values
    , (error, results) => {
      if (error) {
        console.log('error connecting:' + error.stack);
        res.status(400).send({ messsage: 'Error!' });
        return;
      }
      res.redirect("/login");
    });
});

module.exports = router;