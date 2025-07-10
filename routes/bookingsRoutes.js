//預定在 http://localhost:port/api/bookings
const express = require('express');
const bookingRouter = express.Router(); 
const {authMiddleware, optionalAuthMiddleware, authorizeRoles} = require('../middleware/authMiddleware');
const Booking = require('../models/bookingModel');
const {bookingSchema} = require('../schema/bookingSchema');
//Op是sequelize邏輯運算專用
const { Op } = require('sequelize');
const Sequelize  = require('sequelize');


bookingRouter.get('/', optionalAuthMiddleware, async (req, res) => {

  //分頁 => offset是前面排除的資料 offset = (page - 1) * limit
  const limit = parseInt(req.query.limit) || 15;
  const page = parseInt(req.query.page) || 1;
  const offset = (page - 1) * limit;

  //搜尋用 與原先查資料邏輯沒差多少 沒必要分開
  const nameSearch = req.query.name;
  const dateSearch = req.query.date;
  const sortBy = req.query.sort || 'updatedAt';
  const order = [[sortBy, sortBy === 'booking_time' ? 'ASC' : 'DESC']];

  const where = {};
  if (nameSearch){
    
    //外{}:JS object 內{}:Op.like的寫法
    where.name = {[Op.like]: `%${nameSearch}%`};
  }

  if (dateSearch) {
    
    //Sequelize.fn=>轉成只有日期沒時間的格式
    where[Op.and] = Sequelize.where(Sequelize.fn('DATE',
       Sequelize.col('booking_time')), 
       dateSearch
      );

  }

  let attributes;

    //req在middleware被加入req.user, user為sequelize物件(user model)
    //req在整個request能被隨意加入屬性
    if (!req.user){
       
        attributes = [ 'booking_id', 'name', 'booking_time'];
    } else if (req.user.role === 'admin'){
        attributes = undefined; // Sequelize預設抓全部欄位
    } else {
        //role = user
        attributes = [ 'booking_id', 'name', 'booking_time' ];
    }

    try {
      //findAndCountAll分頁用取當前顯示的量
        const {count, rows} = await Booking.findAndCountAll({
          attributes,
          where,
          limit,
          offset,
          order
        });
        res.status(200).json({
          data: rows,
          total:count,
          page, 
          totalPages: Math.ceil(count/limit),
        });
    } catch (error) {
        console.error('獲取預定資訊時發生錯誤:', error);
        res.status(500).json({message: error.message || '內部伺服器錯誤，無法獲取預定資訊。'});
    }
});

bookingRouter.post('/', optionalAuthMiddleware, async (req, res) => {
    const { error, value}= bookingSchema.validate(req.body);

    if (error){
        return res.status(400).json({message: error.details[0].message});
    }


    //這種解構模式是取得該key的value 
    //不想與key值同變數名稱可改const { name: userName, phone, booking_time } = req.body;
    const { name, phone, booking_time } = value;

    try {
        const existing_time = await Booking.findOne({where:{booking_time}});
        if (existing_time){
          return res.status(400).json({message: '此時段已被預約，請選擇其他時間。'});
        }


        const newBooking = await Booking.create ({ // Sequelize: create
            //object shorthand（物件簡寫語法），value的變數名和 key 相同 就能簡寫
            name,
            phone,
            booking_time,
            status: 'pending',
            profile_id: req.user ? req.user.user_id: null
        });
        //sql 輸出的是操作結果
        res.status(201).json(newBooking); 
    } catch (error) {
        console.error('新增預約失敗:', error);
        //使用者輸入錯誤
        if (error.name === 'SequelizeValidationError'){
            const errors = error.errors.map(e=> e.message);
            return res.status(400).json({ message: '驗證錯誤', errors });
        }

        //非使用者輸入問題的其他錯誤
        return res.status(500).json({message: error.message||'未知錯誤' });
        
    }
});


// 拿來改SQL PUT PATCH用起來差不多
bookingRouter.put('/:id', authMiddleware, authorizeRoles('admin'),async (req, res) => {
    const {error, value} = bookingSchema.validate(req.body);

    if (error){
        return res.status(400).json({message: error.details[0].message});
    }

    const booking_id = req.params.id;
    const {name, phone, booking_time, status} = value;

    try {
        const booking = await Booking.findByPk(booking_id);
        if (!booking){
            return res.status(404).json({message: '預約未找到'});
        }


        const existing_time = await Booking.findOne({
          where: {
            booking_time,
            booking_id: {[Op.ne]: booking_id}
          }
        });
        if (existing_time){
          return res.status(400).json({message: '此時段已被預約，請選擇其他時間。'});
        }
        
        await Booking.update({
            name,
            phone,
            booking_time,
            status
        },{
            where: {booking_id}
        })



        
        //不重取的話使用者看到的還是舊資料(更改的結果存在DB)，所以重取讓使用者看到更改的資料
        const updatedBooking = await Booking.findByPk(booking_id);
        res.status(200).json(updatedBooking);
    } catch (error) {
        console.error('更新預約資料失敗:', error);
        if (error.name === 'SequelizeValidationError'){
            const errors = error.errors.map(e => e.message);
            return res.status(400).json({message: '驗證錯誤', errors});
        }
        return res.status(500).json({message: error.message || '未知錯誤'});
    }
    
});


bookingRouter.delete('/:id', authMiddleware, authorizeRoles('admin'), async (req, res) => {
    const booking_id = req.params.id;

    try {
        const deletedRows = await Booking.destroy ({
            where: {booking_id}
        })
        //檢查有沒有刪除"行為"
        if (deletedRows === 0){
            return res.status(404).json({message: '預約未找到或已被刪除' });
        }

        res.status(200).json({message: '預約已刪除'});
    } catch (error){
        console.error( '刪除客戶資料時發生錯誤:', error);
        res.status(500).json({message: error.message});
    }
        
});

module.exports = {bookingRouter};

