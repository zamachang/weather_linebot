// モジュールのインポート
const server = require("express")();
const line = require("@line/bot-sdk"); 
const axios = require('axios');

// 天気予報のURLとapikey
const url = 'http://api.openweathermap.org/data/2.5/weather?id=1857910&units=metric&appid=';
const API_KEY = process.env.API_KEY;

// linebotのチャネルアクセストークンとチャネルシークレット
const line_config = {
    channelAccessToken: process.env.ACCESS_TOKEN, 
    channelSecret: process.env.SECRET_KEY
};

// Webサーバー設定
server.listen(process.env.PORT || 3000);

// APIコールのためのクライアントインスタンスを作成
const bot = new line.Client(line_config);


server.post('/webhook', line.middleware(line_config), (req, res, next) => {
    // 先行してLINE側にステータスコード200でレスポンスする。
    res.sendStatus(200);
 
    req.body.events.forEach((event) => {
        // この処理の対象をイベントタイプがメッセージで、かつ、テキストタイプだった場合に限定。
        if (event.type == "message" && event.message.type == "text") {
            // ユーザーからのテキストメッセージが「天気」だった場合のみ反応。
            if (event.message.text == "天気") {
                axios.get(url + API_KEY)
                    .then((response) => {
                        // 処理が成功したら
                        const weather = response.data.weather[0].main;
                        const temp_min = response.data.main.temp_min;
                        const temp_max = response.data.main.temp_max;
                        const todayweather = '今日の天気は' + weather + "最低気温は" + temp_min + "℃" + "最高気温は" + temp_max + "℃";
                        (bot.replyMessage(event.replyToken, {
                            type: "text",
                            text: todayweather
                        }));
                    })
            }
        }
    });
});