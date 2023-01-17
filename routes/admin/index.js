const router = require('express').Router();
const mysql = require("mysql");
const db = require("../../database.js");
const connection = mysql.createConnection(db);

// 管理者トップ
router.get('/', (req, res) => {
  res.render('admin/index');
});

// イベント一覧
router.get('/events/', (req, res) => {
  async function getEventDateList() {
    const sql = `
    SELECT
      eventdate.id,
      eventdate.event_date
    FROM
      eventdate
    ORDER BY
      eventdate.event_date
    DESC`;
    const eventDateList = await new Promise((resolve, reject) => {
      connection
        .query(
          sql,
          (error, results) => {
            resolve(results);
          }
        );
    });
    return eventDateList;
  }
  async function getExhibitList() {
    const sql = `
    SELECT
      e.id,
      e.car_id,
      e.start_time,
      e.end_time,
      e.eventdate_id,
      e.lowest_winning_bid,
      c.car_model_name,
      b.bodytype_name,
      m.manufacture_name
    FROM
      exhibit AS e
    LEFT JOIN car AS c
    ON
      e.car_id = c.id
    LEFT JOIN bodytype AS b
    ON
      c.body_type_id = b.id
    LEFT JOIN manufacturer AS m
    ON
      m.id = c.manufacturer_id
    ORDER BY
      e.start_time
    DESC`;
    const exhibitList = await new Promise((resolve, reject) => {
      connection
        .query(
          sql,
          (error, results) => {
            resolve(results);
          }
        );
    });
    return exhibitList;
  }

  Promise.all([getEventDateList(), getExhibitList()]).then((results) => {
    res.render('admin/eventList', { eventDateList: results[0], exhibitList: results[1] });
  });
});

// イベント登録
router.post('/events/', (req, res) => {
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

// 未出品の車両一覧
router.get('/cars/', (req, res) => {
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
      car AS c
    LEFT JOIN exhibit AS e
    ON
      e.car_id = c.id
    LEFT JOIN bodytype AS b
    ON
      c.body_type_id = b.id
    WHERE
      e.start_time IS NULL
    ORDER BY
      c.id
    DESC
    `;
  connection.query(
    sql,
    (error, results) => {
      res.render('admin/carlist', { eventDate: [], carList: results });
    }
  );
});

// イベント詳細（車両一覧）
router.get('/events/:id/', (req, res) => {
  // イベント日付
  async function getEventDate() {
    const sql = `
    SELECT
      eventdate.id,
      eventdate.event_date
    FROM
      eventdate
    WHERE
      eventdate.id = ?
    `;
    const eventDate = await new Promise((resolve, reject) => {
      connection.query(
        sql,
        [req.params.id],
        (error, results) => {
          resolve(results);
        }
      );
    });
    return eventDate;
  }
  // 出品車両一覧
  async function getExhibitList() {
    const sql = `
    SELECT
      e.start_time,
      e.end_time,
      e.lowest_winning_bid,
      c.car_model_name,
      m.manufacture_name,
      c.id AS car_id,
      c.mileage,
      c.car_inspection_expiration_date,
      c.repair_history,
      c.number_passengers,
      c.mileage_situation,
      b.bodytype_name
    FROM
      exhibit AS e
    LEFT JOIN car AS c
    ON
      e.car_id = c.id
    LEFT JOIN bodytype AS b
    ON
      c.body_type_id = b.id
    LEFT JOIN manufacturer AS m
    ON
      m.id = c.manufacturer_id
    WHERE
      e.eventdate_id = ?
    ORDER BY
      e.start_time
    ASC
    `;

    const exhibitList = await new Promise((resolve, reject) => {
      connection.query(
        sql,
        [req.params.id],
        (error, results) => {
          resolve(results);
        }
      );
    }
    );
    return exhibitList;
  }
  Promise.all([getEventDate(), getExhibitList()]).then((results) => {
    res.render('admin/carList', { eventDate: results[0], carList: results[1] });
  });
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
    res.render('admin/carRegister', { manufacturerList: results[0], colorList: results[1], bodytypeList: results[2] });
  });
});

router.post('/cars/register/', (req, res) => {
  res.redirect(307, '/admin/cars/register/confirm');
});

//車両登録確認
router.post('/cars/register/confirm/', (req, res) => {
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
      [req.body.manufacturer_id, req.body.mission, req.body.mileage_situation, req.body.grade, req.body.color_id, req.body.imported_model_year, req.body.model_year, req.body.history, req.body.color_detail, req.body.mileage, req.body.Inspection_record_book, req.body.model, req.body.import_route, req.body.number_passengers, req.body.car_condition, req.body.recycling_deposit, req.body.chassis_number, req.body.fuel, req.body.handle, req.body.car_inspection_expiration_date, req.body.repair_history, req.body.owner_history, req.body.body_type_id, req.body.displacement, req.body.doors, req.body.car_model_name, req.body.drive_system, req.body.delivery_conditions, req.body.air_conditioner, req.body.smart_key, req.body.sunroof, req.body.power_steering, req.body.dvd_video, req.body.genuine_leather_seats, req.body.power_window, req.body.cd, req.body.genuine_aero_parts, req.body.central_door_lock, req.body.md, req.body.genuine_aluminum_wheels, req.body.airbag, req.body.tv, req.body.skid_prevention_device, req.body.abs, req.body.navigaiton, req.body.traction_control, req.body.keyless_entry, req.body.back_camera, req.body.cold_region_specification_car, req.body.lowdown, req.body.electric_sliding_door, req.body.welfare_cars, req.body.etc, req.body.no_pets, req.body.limited_edition_car, req.body.non_smoking_car, req.body.test_drive_current_company_confirmation_possible, req.body.instruction_manual, req.body.new_car_warranty, req.body.spare_tire,],
      (error, results) => {
        console.log(error);
      }
    );
    res.redirect('/admin');
    console.log("insert");
  } else {
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
      res.render('admin/carRegisterConfirm', { car: req.body, manufacturer: results[0], color: results[1], bodytype: results[2] });
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
          car AS c
        LEFT JOIN exhibit AS e
        ON
          e.car_id = c.id
        LEFT JOIN bodytype AS b
        ON
          c.body_type_id = b.id
        WHERE
          c.id = ?
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
router.get('/cars/:id/register/', (req, res) => {
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
      car AS c
    LEFT JOIN  exhibit AS e
    ON
      e.car_id = c.id
    LEFT JOIN bodytype AS b
    ON
      c.body_type_id = b.id
    WHERE
      c.id = ?
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
router.post('/cars/:id/register/', (req, res) => {
  async function getEventDate() {
    const eventDate = await new Promise((resolve, reject) => {
      const sql = `
        SELECT
          event_date
        FROM
          eventdate
        WHERE
          id = ?
      `;
      connection.query(
        sql,
        [req.body.event_date_id],
        (error, results) => {
          resolve(results[0]);
        }
      );
    });
    return eventDate;
  }
  async function insertExhibit(eventDate) {
    const sql = `
      INSERT INTO
        exhibit
        (car_id, eventdate_id, start_time, end_time, lowest_winning_bid)
      VALUES
        (?, ?, ?, ?, ?)
      ;
    `;
    const start_time = new Date(eventDate.event_date.toLocaleDateString() + ' ' + req.body.start_time);
    const end_time = new Date(eventDate.event_date.toLocaleDateString() + ' ' + req.body.end_time);
    const values = [
      req.params.id,
      req.body.event_date_id,
      start_time,
      end_time,
      req.body.lowest_winning_bid
    ];
    connection.query(
      sql,
      values,
      (error, results) => {
        console.log(results);
        // インサートされたexhibitのidを取得
        insertBid(results.insertId);
        res.redirect('/admin/cars');
      }
    );
  }
  async function insertBid(insertExhibitId) {
    const sql = `
        INSERT INTO
          bid
          (user_id, exhibit_id, bid_price)
        VALUES
          (?, ?, ?)
        ;
        `;
    const values = [
      1,
      insertExhibitId,
      req.body.lowest_winning_bid
    ];
    connection.query(
      sql,
      values,
      (error, results) => {
        console.log(results);
      }
    );
  }

  Promise.all([getEventDate()]).then((results) => {
    insertExhibit(results[0]);
  });
});

// 車両出品取消し
router.post('/cars/:id/cancel/', (req, res) => {
  // exhibitのidを取得
  async function getExhibitId() {
    const exhibitId = await new Promise((resolve, reject) => {
      const sql = `
        SELECT
          id
        FROM
          exhibit
        WHERE
          car_id = ?
      `;
      connection.query(
        sql,
        [req.params.id],
        (error, results) => {
          resolve(results[0]);
        }
      );
    });
    return exhibitId;
  }
  // exhibitのidを元にbidを削除
  async function deleteBid(exhibitId) {
    const sql = `
      DELETE FROM
        bid
      WHERE
        exhibit_id = ?
      ;
    `;
    connection.query(
      sql,
      [exhibitId.id],
      (error, results) => {
      }
    );
  }
  // exhibitのidを元にexhibitを削除
  async function deleteExhibit(exhibitId) {
    const sql = `
      DELETE FROM
        exhibit
      WHERE
        id = ?
      ;
    `;
    connection.query(
      sql,
      [exhibitId.id],
      (error, results) => {
      }
    );
  }
  Promise.all([getExhibitId()]).then((results) => {
    deleteBid(results[0]);
    deleteExhibit(results[0]);
    res.redirect('/admin/events/' + req.params.id);
  });
});

// 会員管理
router.get('/users/', (req, res) => {
  const sql = `
    SELECT
      *
    FROM
      user
      ;
  `;
  connection.query(
    sql,
    (error, results) => {
      res.render('admin/userList', { userList: results });
    }
  );
});

// 会員の購入履歴
router.get('/users/:id/', (req, res) => {
  const sql = `
    SELECT
      u.last_name,
      u.first_name,
      sb.successful_bid_price,
      sb.payment_status,
      sb.created_at,
      c.car_model_name,
      m.manufacture_name
    FROM
      successful_bid AS sb
    LEFT JOIN
      user AS u
    ON
      sb.user_id = u.id
    LEFT JOIN
      exhibit AS e
    ON
      sb.exhibit_id = e.id
    LEFT JOIN
      car AS c
    ON
      e.car_id = c.id
    LEFT JOIN
      bodytype AS b
    ON
      c.body_type_id = b.id
    LEFT JOIN
      manufacturer AS m
    ON
      m.id = c.manufacturer_id
    WHERE
      u.id = ?
    ORDER BY
      sb.created_at
    DESC
    ;
  `;
  connection.query(
    sql,
    [req.params.id],
    (error, results) => {
      res.render('admin/userDetail', { carList: results });
    });
});

// 会員削除
router.post('/users/:id/delete/', (req, res) => {
  const sql = `
    DELETE FROM
      user
    WHERE
      id = ?
      ;
  `;
  connection.query(
    sql,
    [req.params.id],
    (error, results) => {
      res.redirect('/admin/users');
    }
  );
});

router.get('/sales/', (req, res) => {
  const sql = `
    SELECT
      u.id,
      u.last_name,
      u.first_name,
      sb.successful_bid_price,
      sb.payment_status,
      sb.created_at,
      c.car_model_name,
      m.manufacture_name
    FROM
      successful_bid AS sb
    LEFT JOIN
      user AS u
    ON
      sb.user_id = u.id
    LEFT JOIN
      exhibit AS e
    ON
      sb.exhibit_id = e.id
    LEFT JOIN
      car AS c
    ON
      e.car_id = c.id
    LEFT JOIN
      bodytype AS b
    ON
      c.body_type_id = b.id
    LEFT JOIN
      manufacturer AS m
    ON
      m.id = c.manufacturer_id
    ORDER BY
      sb.created_at
    DESC
    ;
  `;
  connection.query(
    sql,
    (error, results) => {
      res.render('admin/salesList', { saleList: results });
    });
});

module.exports = router;