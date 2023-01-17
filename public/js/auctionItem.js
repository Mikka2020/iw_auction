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

//ボタンが押されたときの処理に使う変数の初期値。
var addPrice1 = document.getElementById("addPrice1");
var addPrice2 = document.getElementById("addPrice2");
var addPrice3 = document.getElementById("addPrice3");
var addPrice4 = document.getElementById("addPrice4");
var bidPlusPrice = document.getElementById("bidPlusPrice");
var plusSumPrice;
var modalBestPrice = document.getElementById("modalBestPrice");
var modalPlusPrice = document.getElementById("modalPlusPrice");
var modalSumPrice = document.getElementById("modalSumPrice");


var biggest_bid = document.getElementById("biggest_bid");
var bid_price = document.getElementById("bid_price");
var clear = document.getElementById("clear");
var bid_submit = document.getElementById("bid_submit");
var bid_confirm = document.getElementById("bid_confirm");
var startTime = document.getElementById("start_time");
var endTime = document.getElementById("end_time");
var start_time = new Date(start_time);
var end_time = new Date(end_time);

var startHours = start_time.getHours();
var startMinutes = start_time.getMinutes();
var endHours = end_time.getHours();
var endMinutes = end_time.getMinutes();

var productStatusLeft = document.getElementById("productStatusLeft");
var productStatusActive = document.getElementById("productStatusActive");
var bid = document.getElementById("bid");
var next_bid = document.getElementById("nextBid");
var productLimit = document.getElementById("productLimit");
var productTime = document.getElementById("productTime");

if(startHours == 0){
  startHours = '00';
}else{
  startHours = startHours.toString();
}
if(startMinutes == 0){
  startMinutes = '00';
}else{
  startMinutes = startMinutes.toString();
}
if(endHours == 0){
  endtHours = '00';
}else{
  endHours = endHours.toString();
}
if(endMinutes == 0){
  endMinutes = '00';
}else{
  endMinutes = endMinutes.toString();
}

startTime.innerHTML = startHours+':'+startMinutes;
endTime.innerHTML = endHours+':'+endMinutes;


//1つ目のボタンが押されたとき
addPrice1.addEventListener('click',function(){
  bid_price_sum = Number(bid_price.innerText)+Number(addPrice1.value);
  bid_price.innerHTML = bid_price_sum;
  plusSumPrice = Number(bidPlusPrice.innerText)+Number(addPrice1.value);
  bidPlusPrice.innerHTML = plusSumPrice;
});
//2つ目のボタンが押されたとき
addPrice2.addEventListener('click',function(){
  bid_price_sum = Number(bid_price.innerText)+Number(addPrice2.value);
  bid_price.innerHTML = bid_price_sum;
  plusSumPrice = Number(bidPlusPrice.innerText)+Number(addPrice2.value);
  bidPlusPrice.innerHTML = plusSumPrice;
});
//3つ目のボタンが押されたとき
addPrice3.addEventListener('click',function(){
  bid_price_sum = Number(bid_price.innerText)+Number(addPrice3.value);
  bid_price.innerHTML = bid_price_sum;
  plusSumPrice = Number(bidPlusPrice.innerText)+Number(addPrice3.value);
  bidPlusPrice.innerHTML = plusSumPrice;
});
//4つ目のボタンが押されたとき
addPrice4.addEventListener('click',function(){
  bid_price_sum = Number(bid_price.innerText)+Number(addPrice4.value);
  bid_price.innerHTML = bid_price_sum;
  plusSumPrice = Number(bidPlusPrice.innerText)+Number(addPrice4.value);
  bidPlusPrice.innerHTML = plusSumPrice;
});
//クリアボタンが押されたとき
clear.addEventListener('click',function(){
  bid_price.innerHTML = biggest_bid.innerText;
  bidPlusPrice.innerHTML = '0';
});

//入札するボタンが押されたとき
bid_submit.addEventListener('click',function(event){
  modalPlusPrice.innerHTML = bidPlusPrice.innerText;
  modalSumPrice.innerHTML = Number(modalBestPrice.innerText)+ Number(modalPlusPrice.innerText);
});

//モーダルの入札確定ボタンが押されたとき
bid_confirm.addEventListener('click',function(event){
  event.preventDefault();
  const sendData = 
  {
    auctionId:auctionId,
    value:Number(bid_price.innerHTML),
    user_id:user_id
  }
  //sendDataをサーバーへ排出。
  socketio.emit('c2s',sendData);
});



//s2cという宣言名でクライアントとのコネクションが確立したとき
socketio.on('s2c',function(msg){
  biggest_bid.innerHTML = msg.value;
  bid_price.innerHTML = msg.value;
  bidPlusPrice.innerHTML = '0';
  modalBestPrice.innerHTML = msg.value;
  modalPlusPrice.innerHTML = '0';
  modalSumPrice.innerHTML = msg.value;

});

//s2c-endtimeという宣言名でクライアントとのコネクションが確立したとき。
socketio.on('s2c-endtime',function(value){
  if(user_id == value.user_id){ 
    bestHead.innerHTML = "最終落札額";
    productStatusActive.innerHTML = "落札終了";
    productStatusLeft.style.display ="none";
    bid.style.display ="none";
    nextBid.style.display ="none";
    $(function () {
          $('#modalOkArea').fadeIn();
    });
    
  }else{
    bestHead.innerHTML = "最終落札額";
    productStatusActive.innerHTML = "落札終了";
    productStatusLeft.style.display ="none";
    bid.style.display ="none";
    nextBid.style.display ="none";
    $(function () {
      $('#modalNoArea').fadeIn();
    });
  }
});




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
  if(calcHour >= 0 && calcMin >= 0 && calcSec >= 0){
    hour.innerHTML = calcHour < 10 ? '0' + calcHour : calcHour;
    min.innerHTML = calcMin < 10 ? '0' + calcMin : calcMin;
    sec.innerHTML = calcSec < 10 ? '0' + calcSec : calcSec;
  }
  else if(calcHour == -1 && calcMin == -1 && calcSec == -1){
    //目的時刻に到達したとき
    const sendData = {
      auctionId:auctionId
    }
  //sendDataをサーバーへ排出。
  socketio.emit('c2s-endtime',sendData);
  }else{
    //使用しない分岐
  }
  
}

$(function () {
  $('#closeOkModal , #modalOkBg').click(function(){
    $('#modalOkArea').fadeOut();
  });
  $('#closeNoModal , #modalNoBg').click(function(){
    $('#modalNoArea').fadeOut();
  });
  $('#linkCloseModal').click(function(){
    $('#modalOkArea').fadeOut();
  });
});

if(start_date <= now_date && now_date <=end_date){//競売中～
  console.log("開催中です");
  countdown(end_date);
  setInterval("countdown(end_date)",1000);
}
if(now_date < start_date){//競売開始してないよ～
  console.log("まだ開催してないよ");
  var startYear = start_date.getFullYear();
  var startMonth = start_date.getMonth()+1;
  var startDay = start_date.getDate();


  nextBid.style.display ="none";
  productLimit.innerHTML ="開催日";
  productStatusActive.innerHTML = "開催予定";
  productTime.innerHTML=startYear+"年<br><br>"+startMonth+"月"+startDay+"日";
  bestHead.innerHTML = "落札開始額";
  bid.style.display = "none";
}
if(end_date < now_date){//競売終了時
  console.log("この競売は終了しました。");

  bestHead.innerHTML = "最終落札額";
  productStatusActive.innerHTML = "落札終了";
  productStatusLeft.style.display ="none";
  bid.style.display ="none";
  nextBid.style.display ="none";
}


//クライアントからルーム名を送信
const sendData = {
  auctionId:auctionId
}
socketio.emit('c2s-join',sendData);