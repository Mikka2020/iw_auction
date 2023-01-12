"use strict";
const express = require("express");
const app = express();

app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public", { index: false }));
app.use(express.static(__dirname + "/views", { index: false }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// DB接続
const mysql = require("mysql");
// constファイルからDB接続情報を取得
const db = require("./database.js");
const connection = mysql.createConnection(db);
connection.connect((error) => {
  if (error) {
    return;
  }
  console.log("success");
});

//socket通信準備
const http_socket = require('http').Server(app);
const io_socket = require('socket.io')(http_socket);

// ルーティング
// ユーザー
// トップページ
app.use("/", require("./routes/index"));
// オークション
app.use("/auctions", require("./routes/auctions"));
// ログイン
app.use("/login", require("./routes/login"));
// 会員登録
app.use("/register", require("./routes/register"));
// マイページ
app.use("/mypage", require("./routes/mypage"));
app.get("/logout", (req, res, next) => {
  req.logout(
    (error) => next(error)
  );
  res.redirect("/")
});

// マスタ
// 車両一覧
app.use("/admin", require("./routes/admin/index"));

http_socket.listen(9000);

// サーバー
io_socket.on('connection', function (socket) {
   console.log('connected');
  //サーバーからの発信時、ルーム名を付ける。
  socket.on('c2s',function(msg){
    //DBに更新をかける。
    const sql = `INSERT 
    INTO
    bid 
    (user_id,exhibit_id,bid_price)
    values (` + msg.user_id + `,` + msg.auctionId + `,` + msg.value + `)`;
    console.log(sql);
    connection.query(
      sql,
      (error, results) => {
        if (error) {
          console.log('error connecting:' + error.stack);
          return;
        }
        io_socket.to(msg.auctionId).emit('s2c',msg);
      }
    );
  });
  //サーバがオークションid名を受け取り、参加
  socket.on('c2s-join', function (msg) {
    console.log('c2s-roomJoin:' + msg.auctionId);
    socket.join(msg.auctionId);
  });
});
