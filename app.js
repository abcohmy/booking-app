// 載入.env 隱藏的變數資料
require('dotenv').config();
const port = process.env.PORT || 5000;


const express = require('express');
const cors = require('cors');

const {initializeDb} = require('./db');
const User = require('./models/userModel');
const Booking = require('./models/bookingModel');
const authRoutes = require('./routes/authRoutes');
const bookingsRoutes = require('./routes/bookingsRoutes');



const app = express();
//cors middleware網路安全使用
app.use(cors());
//解析json需要的body-parser
app.use(express.json()); //解析json
//app.use(express.urlencoded({extended:true})); //解析url-encoded 格式的請求體 (HTM 表單提交)

app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingsRoutes);

app.get('/', (req, res) => {
    res.send('歡迎來到主頁!');
});


const startServer = async () => {
    await initializeDb();
    app.listen(port, () => {
    console.log (`Express server is listening http://localhost:${port}`);
});
};


startServer();







