//接続確立
const socketio=io();
const hour = document.getElementById("hour");//view用の時間
const min = document.getElementById("min");//view用の分
const sec = document.getElementById("sec");//view用の秒


//開始時間、終了時間をdate型に変換する。
var start_date = new Date(start_time);
var end_date = new Date(end_time);
var now_date = new Date();
console.log(now_date);
console.log(end_date);

/**
 * 終了時刻に対しての現在時刻をreturnするクラス
 * param end_date :終了時刻
 * return:value.
 */
function countdown(end_date) {//カウントダウンクラス
  var now_date = new Date(); // 現在時刻を取得
  // const end_date = new Date(end_date.getFullYear(),end_date.getMonth(),end_date.getDate()+1); // 明日の0:00を取得
  
  var diff = end_date.getTime() - now_date.getTime(); // 時間の差を取得（ミリ秒）

  // ミリ秒から単位を修正
  var calcHour = Math.floor(diff / 1000 / 60 / 60);
  var calcMin = Math.floor(diff / 1000 / 60) % 60;
  var calcSec = Math.floor(diff / 1000) % 60;

  // 取得した時間を表示（2桁表示）
  hour.innerHTML = calcHour < 10 ? '0' + calcHour : calcHour;
  min.innerHTML = calcMin < 10 ? '0' + calcMin : calcMin;
  sec.innerHTML = calcSec < 10 ? '0' + calcSec : calcSec;
  
}

if(start_date <= now_date && now_date <=end_date){//競売中～
  console.log("開催中です");
  countdown(end_date);
  setInterval("countdown(end_date)",1000);
}
if(now_date < start_date){//競売開始してないよ～
  console.log("まだ開催してないよ");

}
if(end_date < now_date){//競売終了時
  console.log("この競売は終了しました。");
}


//クライアントからルーム名を送信
const sendData = {
  auctionId:auctionId
}
socketio.emit('c2s-join',sendData);