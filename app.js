// 載入.env 隱藏的變數資料
require('dotenv').config();


const express = require('express');
const cors = require('cors');

const User = require('./models/userModel');
const Booking = require('./models/bookingModel');
const authRoutes = require('./routes/authRoutes');
const bookingsRoutes = require('./routes/bookingsRoutes');



const app = express();
//cors middleware網路安全使用
app.use(cors());

app.use(cors({
  origin: 'http://localhost:3000', // 指定允許的來源
  credentials: true                // 若有 cookie/token 需要傳送
}));

//解析json需要的body-parser
app.use(express.json()); //解析json
//app.use(express.urlencoded({extended:true})); //解析url-encoded 格式的請求體 (HTM 表單提交)

app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingsRoutes);




module.exports=app;







