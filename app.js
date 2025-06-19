// 載入.env 隱藏的變數資料
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

const db = require('./db');
const bookingsRoutes = require('./routes/bookings');

//cors middleware網路安全使用
app.use(cors());


//解析json需要的body-parser
app.use(express.json()); //解析json
app.use(express.urlencoded({extended:true})); //解析url-encoded 格式的請求體 (HTM 表單提交)


db.initializeDb()
    .then(() => console.log('成功連接至資料庫'))
    .catch(err => console.error('資料庫連線失敗:', err));

app.use('/bookings', bookingsRoutes);


app.get('/', (req, res) => {
    res.send('歡迎來到主頁!');
});




app.listen(port, () => {
    console.log (`Express server is listening http://localhost:${port}`);
});


/*git test*/