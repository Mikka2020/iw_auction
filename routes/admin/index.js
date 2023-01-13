const router = require('express').Router();
const mysql = require("mysql");
const db = require("../../database.js");
const connection = mysql.createConnection(db);

// 管理者トップ
router.get('/', (req, res) => {
  res.render('admin/index');
});

// イベント一覧
router.get('/events', (req, res) => {
  const sql = `
    SELECT
      eventdate.id,
      eventdate.event_date
    FROM
      eventdate
    ORDER BY
      eventdate.event_date
    DESC`;
  connection.query(
    sql,
    (error, results) => {
      res.render('admin/eventlist', { data: results });
    }
  );
});

// イベント登録
router.post('/events', (req, res) => {
  const sql = `
    INSERT INTO
      eventdate (event_date)
    VALUES
      (?)`;
  connection.query(
    sql,
    [req.body.event_date],
    (error, results) => {
      res.redirect('/admin/events');
    }
  );
});

// 車両一覧
router.get('/cars', (req, res) => {
  const sql = `
    SELECT
      e.start_time,
      e.end_time,
      c.car_model_name,
      b.bodytype_name,
      c.id AS car_id,
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
      c.body_type_id = b.id
      `;
  connection.query(
    sql,
    (error, results) => {
      res.render('admin/carlist', { data: results });
    }
  );
});

// 車両登録
router.get('/cars/register/', (req, res) => {
  async function getCarManufacturerList() {
    const carManufacturer = await new Promise((resolve, reject) => {
    const sql = `
    SELECT
      id,
      manufacture_name
    FROM
      manufacturer
    `;
      connection.query(
        sql,
        (error, results) => {
          resolve(results);
        }
      );
    });
    return carManufacturer;
  }
  async function getCarColorList() {
    const carColor = await new Promise((resolve, reject) => {
    const sql = `
    SELECT
      id,
      color_name
    FROM
      color
    `;
      connection.query(
        sql,
        (error, results) => {
          resolve(results);
        }
      );
    });
    return carColor;
  }
  async function getCarBodytypeList() {
    const carBodytype = await new Promise((resolve, reject) => {
    const sql = `
    SELECT
      id,
      bodytype_name
    FROM
      bodytype
    `;
      connection.query(
        sql,
        (error, results) => {
          resolve(results);
        }
      );
    });
    return carBodytype;
  }
  Promise.all([getCarManufacturerList(), getCarColorList(), getCarBodytypeList()]).then((results) => {
    console.log(results);
    console.log();
    res.render('admin/carRegister', { manufacturerList: results[0], colorList: results[1], bodytypeList: results[2]});
  });
});

router.post('/cars/register/',(req, res) => {
  console.log(req.body.model_year);
  res.redirect(307,'/admin/cars/register/confirm');
});

//車両登録確認
router.post('/cars/register/confirm/',(req,res) => {
  
  // if (req.body.submit == 1) {
  //   //登録
  // }else{
    //メーカー、色、ボディタイプ取得
    async function getCarManufacturer() {
      const carManufacturer = await new Promise((resolve, reject) => {
      const sql = `
      SELECT
        manufacture_name
      FROM
        manufacturer
      WHERE
        id = ` + req.body.manufacturer_id + `
      `;
        connection.query(
          sql,
          (error, results) => {
            resolve(results);
          }
        );
      });
      return carManufacturer;
    }
    async function getCarColor() {
      const carColor = await new Promise((resolve, reject) => {
      const sql = `
      SELECT
        color_name
      FROM
        color
      WHERE
        id = ` + req.body.color_id + `
      `;
        connection.query(
          sql,
          (error, results) => {
            resolve(results);
          }
        );
      });
      return carColor;
    }
    async function getCarBodytype() {
      const carBodytype = await new Promise((resolve, reject) => {
      const sql = `
      SELECT
        bodytype_name
      FROM
        bodytype
      WHERE
        id = ` + req.body.bodytype_id + `
      `;
        connection.query(
          sql,
          (error, results) => {
            resolve(results);
          }
        );
      });
      return carBodytype;
    }
    Promise.all([getCarManufacturer(), getCarColor(), getCarBodytype()]).then((results) => {
      console.log(results[0], results[1], results[2]);
      console.log(req.body.dvd_video);
      res.render('admin/carRegisterConfirm', { car: req.body, manufacturer: results[0], color: results[1], bodytype: results[2]});
    });
  // }
  
});

// 車両詳細
router.get('/cars/:id/', (req, res) => {
  
  async function getCarItem() {
    const carItem = await new Promise((resolve, reject) => {
      const sql = `
      SELECT
        e.start_time,
        e.end_time,
        c.car_model_name,
        b.bodytype_name,
        c.id AS car_id,
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
        c.body_type_id = b.id
      `;
      connection.query(
        sql,
        [req.params.id],
        (error, results) => {
          resolve(results[0]);
        }
      );
    });
    return carItem;
  }
  async function getEventDateList() {
    const eventDateList = await new Promise((resolve, reject) => {
      const sql = `
        SELECT
          eventdate.id,
          eventdate.event_date
        FROM
          eventdate
        WHERE
          event_date >= CURDATE()
        ORDER BY
          eventdate.event_date
        DESC`;
      connection.query(
        sql,
        (error, results) => {
          resolve(results);
        }
      );
    });
    return eventDateList;
  }
  Promise.all([getCarItem(), getEventDateList()]).then((results) => {
    res.render('admin/carItem', { data: results[0], eventDateList: results[1] });
  });
});

// 車両出品
router.get('/cars/:id/register', (req, res) => {
  const sql = `
    SELECT
      e.start_time,
      e.end_time,
      c.car_model_name,
      b.bodytype_name,
      c.id AS car_id,
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
      c.body_type_id = b.id
      `;
  async function getCarItem() {
    const carItem = await new Promise((resolve, reject) => {
      connection.query(
        sql,
        [req.params.id],
        (error, results) => {
          resolve(results[0]);
        }
      );
    });
    return carItem;
  }
  async function getEventDateList() {
    const eventDateList = await new Promise((resolve, reject) => {
      const sql = `
        SELECT
          eventdate.id,
          eventdate.event_date
        FROM
          eventdate
        WHERE
          event_date >= CURDATE()
        ORDER BY
          eventdate.event_date
        DESC`;
      connection.query(
        sql,
        (error, results) => {
          resolve(results);
        }
      );
    });
    return eventDateList;
  }
  Promise.all([getCarItem(), getEventDateList()]).then((results) => {
    res.render('admin/carExhibit', { data: results[0], eventDateList: results[1] });
  });
});

// 車両出品
router.post('/cars/:id/register', (req, res) => {
  const sql = ``
  connection.query(
    sql,
    (error, results) => {
      res.redirect('/admin/cars');
    }
  );
});

module.exports = router;