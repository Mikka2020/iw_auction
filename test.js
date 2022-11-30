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
      `SELECT e.start_time, e.end_time, c.car_model_name, b.bodytype_name, c.mileage_situation, c.number_passengers, c.repair_history, c.car_inspection_expiration_date, c.mileage, e.lowest_winning_bid 
      FROM exhibit AS e 
      LEFT JOIN car AS c 
      ON e.car_id = c.id 
      LEFT JOIN bodytype AS b 
      ON c.body_type_id = b.id`,
      (error, results) => {
        console.log(results);
        res.render('admin_carlist.ejs',{data:results});
      }
    );
  });


  
  app.listen(9000);