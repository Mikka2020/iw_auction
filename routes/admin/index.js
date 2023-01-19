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

const multer = require('multer');
const upload = multer({ dest: 'public/img/tmp/' });
router.post('/cars/register/', upload.array('files', 4), (req, res) => {
  req.session.carRegisterData = req.body;

  // 画像ファイルをtmpフォルダに保存
  console.log(req.files);
  if (req.files) {
    req.session.carRegisterData.file = req.files;
  }
  res.redirect(307, '/admin/cars/register/confirm');
});

// fs
const fs = require('fs');
//車両登録確認
router.post('/cars/register/confirm/', (req, res) => {
  // セッションに保存されたデータを取得
  const carRegisterData = req.session.carRegisterData;
  // セッションに保存されたデータを削除
  req.session.carRegisterData = null;

  if (req.body.submit == true) {
    //登録
    const sql = `
    INSERT INTO
      car (manufacturer_id, mission, mileage_situation, grade, color_id, imported_model_year, model_year, history, color_detail, mileage, Inspection_record_book, model, import_route, number_passengers, car_condition, recycling_deposit, chassis_number, fuel, handle, car_inspection_expiration_date, repair_history, owner_history, body_type_id, displacement, doors, car_model_name, drive_system, delivery_conditions, air_conditioner, smart_key, sunroof, power_steering, dvd_video, genuine_leather_seats, power_window, cd, genuine_aero_parts, central_door_lock, md, genuine_aluminum_wheels, airbag, tv, skid_prevention_device, abs, navigaiton, traction_control, keyless_entry, back_camera, cold_region_specification_car, lowdown, electric_sliding_door, welfare_cars, etc, no_pets, limited_edition_car, non_smoking_car, test_drive_current_company_confirmation_possible, instruction_manual, new_car_warranty, spare_tire)
    VALUES
      (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `;

    const values = [
      carRegisterData.manufacturer_id,
      carRegisterData.mission,
      carRegisterData.mileage_situation,
      carRegisterData.grade,
      carRegisterData.color_id,
      carRegisterData.imported_model_year,
      carRegisterData.model_year,
      carRegisterData.history,
      carRegisterData.color_detail,
      carRegisterData.mileage,
      carRegisterData.Inspection_record_book,
      carRegisterData.model,
      carRegisterData.import_route,
      carRegisterData.number_passengers,
      carRegisterData.car_condition,
      carRegisterData.recycling_deposit,
      carRegisterData.chassis_number,
      carRegisterData.fuel,
      carRegisterData.handle,
      carRegisterData.car_inspection_expiration_date,
      carRegisterData.repair_history,
      carRegisterData.owner_history,
      carRegisterData.body_type_id,
      carRegisterData.displacement,
      carRegisterData.doors,
      carRegisterData.car_model_name,
      carRegisterData.drive_system,
      carRegisterData.delivery_conditions,
      carRegisterData.air_conditioner || 0,
      carRegisterData.smart_key || 0,
      carRegisterData.sunroof || 0,
      carRegisterData.power_steering || 0,
      carRegisterData.dvd_video || 0,
      carRegisterData.genuine_leather_seats || 0,
      carRegisterData.power_window || 0,
      carRegisterData.cd || 0,
      carRegisterData.genuine_aero_parts || 0,
      carRegisterData.central_door_lock || 0,
      carRegisterData.md || 0,
      carRegisterData.genuine_aluminum_wheels || 0,
      carRegisterData.airbag || 0,
      carRegisterData.tv || 0,
      carRegisterData.skid_prevention_device || 0,
      carRegisterData.abs || 0,
      carRegisterData.navigaiton || 0,
      carRegisterData.traction_control || 0,
      carRegisterData.keyless_entry || 0,
      carRegisterData.back_camera || 0,
      carRegisterData.cold_region_specification_car || 0,
      carRegisterData.lowdown || 0,
      carRegisterData.electric_sliding_door || 0,
      carRegisterData.welfare_cars || 0,
      carRegisterData.etc || 0,
      carRegisterData.no_pets || 0,
      carRegisterData.limited_edition_car || 0,
      carRegisterData.non_smoking_car || 0,
      carRegisterData.test_drive_current_company_confirmation_possible || 0,
      carRegisterData.instruction_manual || 0,
      carRegisterData.new_car_warranty || 0,
      carRegisterData.spare_tire || 0,
    ];
    connection.query(
      sql,
      values,
      (error, results) => {
        console.log(error);
        // 画像ファイルをpublic/img/carId/に移動
        if (carRegisterData.file) {
          // インサートした車両のidを取得
          connection.query(
            `
            SELECT id FROM car ORDER BY id DESC LIMIT 1
            `,
            (error, results) => {
              if (error) {
                console.log(error);
              }
              const carId = results[0].id;
              const dir = 'public/img/' + carId;
              if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir);
              }
              for (let i = 0; i < carRegisterData.file.length; i++) {
                const file = carRegisterData.file[i];
                const filePath = dir + '/' + (i + 1) + '.png';
                fs.renameSync(file.path, filePath);
              }
              // tmpフォルダの画像を削除
              const tmpDir = 'public/img/tmp';
              fs.readdir(tmpDir, (err, files) => {
                if (err) throw err;
                for (const file of files) {
                  fs.unlink(path.join
                    (tmpDir, file), err => {
                      if (err) throw err;
                    });
                }
              });
            }
          )
        }
      }
    );

    res.redirect('/admin/cars/');
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
        id = ` + carRegisterData.manufacturer_id + `
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
        id = ` + carRegisterData.color_id + `
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
        id = ` + carRegisterData.body_type_id + `
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
      // carRegisterDataをセッションに保存
      req.session.carRegisterData = carRegisterData;
      res.render('admin/carRegisterConfirm', { car: carRegisterData, manufacturer: results[0], color: results[1], bodytype: results[2] });
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
      LEFT JOIN  exhibit AS e
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
        ASC`;
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
        res.redirect('/admin/events/' + req.body.event_date_id + '/');
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