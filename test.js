const express = require('express');
const mysql = require('mysql');

const app = express();

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'auction_db'
});

connection.connect((err) => {
    if (err) {
      console.log('error connecting: ' + err.stack);
      return;
    }
    console.log('success');
  });

  app.get('/', (req, res) => {
    connection.query(
      'SELECT * FROM car',
      (error, results) => {
        // console.log(results);
        res.render('hello.ejs',{data:results[0]});
      }
    );
  });


  
  app.listen(9000);