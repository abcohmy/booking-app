// @ts-check
//預定在 http://localhost:port/bookings
const express = require('express');
const router = express.Router(); 
const {authMiddleware, optionalAuthMiddleware, authorizeRoles} = require('../middleware/authMiddleware');
const Booking = require('../models/bookingModel');


router.get('/', optionalAuthMiddleware, async (req, res) => {
    let attributes;

    //req在middleware被加入req.user, user為sequelize物件(user model)
    //req在整個request能被隨意加入屬性
    if (!req.user){
        //未登入
        attributes = ['name', 'booking_time'];
    } else if (req.user.role === 'admin'){
        attributes = undefined; // Sequelize預設抓全部欄位
    } else {
        //role = user
        attributes = ['name', 'booking_time' ];
    }

    try {
        const bookings = await Booking.findAll({attributes});
        res.json(bookings);
    } catch (error) {
        console.error('獲取預定資訊時發生錯誤:', error);
        res.status(500).json({message: '內部伺服器錯誤，無法獲取預定資訊。'});
    }
});

router.post('/', optionalAuthMiddleware, async (req, res) => {
    //這種解構模式是取得該key的value 
    //不想與key值同變數名稱可改const { name: userName, phone, booking_time } = req.body;
    const { name, phone, booking_time } = req.body;

    try {
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
        return res.status(400).json({message: error.message||'未知錯誤' });
        
    }
});


// 拿來改SQL PUT PATCH用起來差不多
router.put('/:id', authMiddleware, authorizeRoles('admin'),async (req, res) => {
    const {id} = req.params;
    const {name, phone, booking_time, status} = req.body;

    try {
        const booking = await Booking.findByPk(id);
        if (!booking){
            return res.status(404).json({message: '預約未找到'});
        }

        //sequelize update回傳一組資料 其中第一個是更新數(在此自己設定成affectedCount)
        // JavaScript 陣列解構賦值可只取第一個，剩下拋棄
        const [affectedCount] = await Booking.update({
            name,
            phone,
            booking_time,
            status
        },{
            where: {id}
        })


        // affectedCount在檢查資料庫 UPDATE 操作的結果
        if (affectedCount  === 0){
            return res.status(400).json({message: `更新失敗或沒有數據修改。`});
        }
        
        //不重取的話使用者看到的還是舊資料(更改的結果存在DB)，所以重取讓使用者看到更改的資料
        const updatedBooking = await Booking.findByPk(id);
        res.json(updatedBooking);
    } catch (error) {
        console.error('更新預約資料失敗:', error);
        if (error.name === 'SequelizeValidationError'){
            const errors = error.errors.map(e => e.message);
            return res.status(400).json({message: '驗證錯誤', errors});
        }
        return res.status(400).json({message: error.message || '未知錯誤'});
    }
    
});


router.delete('/:id', authMiddleware, authorizeRoles('admin'), async (req, res) => {
    const { id } = req.params;

    try {
        const deletedRows = await Booking ({
            where: {id}
        })
        //檢查有沒有刪除"行為"
        if (deletedRows === 0){
            return res.status(404).json({message: '預約未找到或已被刪除' });
        }

        res.json({message: '預約已刪除'});
    } catch (error){
        console.error( '刪除客戶資料時發生錯誤:', error);
        res.status(500).json({message: error.message});
    }
        
});

module.exports = router;

