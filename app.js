require('dotenv-flow').config();

const express = require('express');
const cors = require('cors');


const {authRouter} = require('./routes/authRoutes');
const {bookingRouter} = require('./routes/bookingsRoutes');



const app = express();
//網路安全
app.use(cors());

app.use(cors({
  origin: 'http://localhost:3000', // 前端
  credentials: true                // for cookie/token
}));

app.use(express.json()); //解析json
//app.use(express.urlencoded({extended:true})); //解析url-encoded 格式的請求體 (HTM 表單提交)

app.use('/api/auth', authRouter);
app.use('/api/bookings', bookingRouter);




module.exports=app;







