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
    res.render('admin/carRegister', { manufacturerList: results[0], colorList: results[1], bodytypeList: results[2]});
  });
});

router.post('/cars/register/',(req, res) => {
  res.redirect(307,'/admin/cars/register/confirm');
});

//車両登録確認
router.post('/cars/register/confirm/',(req,res) => {
  if (req.body.submit == true) {
    //登録
    const sql = `
    INSERT INTO
      car (manufacturer_id, mission, mileage_situation, grade, color_id, imported_model_year, model_year, history, color_detail, mileage, Inspection_record_book, model, import_route, number_passengers, car_condition, recycling_deposit, chassis_number, fuel, handle, car_inspection_expiration_date, repair_history, owner_history, body_type_id, displacement, doors, car_model_name, drive_system, delivery_conditions, air_conditioner, smart_key, sunroof, power_steering, dvd_video, genuine_leather_seats, power_window, cd, genuine_aero_parts, central_door_lock, md, genuine_aluminum_wheels, airbag, tv, skid_prevention_device, abs, navigaiton, traction_control, keyless_entry, back_camera, cold_region_specification_car, lowdown, electric_sliding_door, welfare_cars, etc, no_pets, limited_edition_car, non_smoking_car, test_drive_current_company_confirmation_possible, instruction_manual, new_car_warranty, spare_tire)
    VALUES
      (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `;
    console.log(sql);
  connection.query(
    sql,
    [req.body.manufacturer_id, req.body.mission, req.body.mileage_situation, req.body.grade, req.body.color_id, req.body.imported_model_year, req.body.model_year, req.body.history, req.body.color_detail, req.body.mileage, req.body.Inspection_record_book, req.body.model, req.body.import_route, req.body.number_passengers, req.body.car_condition, req.body.recycling_deposit, req.body.chassis_number, req.body.fuel, req.body.handle, req.body.car_inspection_expiration_date, req.body.repair_history, req.body.owner_history, req.body.body_type_id, req.body.displacement, req.body.doors, req.body.car_model_name, req.body.drive_system, req.body.delivery_conditions, req.body.air_conditioner, req.body.smart_key, req.body.sunroof, req.body.power_steering, req.body.dvd_video, req.body.genuine_leather_seats, req.body.power_window, req.body.cd, req.body.genuine_aero_parts, req.body.central_door_lock, req.body.md, req.body.genuine_aluminum_wheels, req.body.airbag, req.body.tv, req.body.skid_prevention_device, req.body.abs, req.body.navigaiton, req.body.traction_control, req.body.keyless_entry, req.body.back_camera, req.body.cold_region_specification_car, req.body.lowdown, req.body.electric_sliding_door, req.body.welfare_cars, req.body.etc, req.body.no_pets, req.body.limited_edition_car, req.body.non_smoking_car, req.body.test_drive_current_company_confirmation_possible, req.body.instruction_manual, req.body.new_car_warranty, req.body.spare_tire, ],
    (error, results) => {
      console.log(error);
    }
  );
    res.redirect('/admin');
    console.log("insert");
  }else{
    //idと一致するメーカー、色、ボディタイプ取得
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
        id = ` + req.body.body_type_id + `
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
      res.render('admin/carRegisterConfirm', { car: req.body, manufacturer: results[0], color: results[1], bodytype: results[2]});
    });
  }
  
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