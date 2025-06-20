
//預定在 http://localhost:port/bookings
const express = require('express');
const router = express.Router(); 

const db = require('../db');

router.get('/', async (req, res) => {
    try {
        const bookings = await db.query('SELECT * FROM bookings ORDER BY booking_time');
        res.json(bookings);
    } catch (error) {
        console.error('獲取預定資訊時發生錯誤:', error);
        res.status(500).json({message: '內部伺服器錯誤，無法獲取預定資訊。'});
    }
});

router.post('/', async (req, res) => {
    const newUser = req.body;

    //輸入驗證
    if (!newUser.name || !newUser.phone || !newUser.booking_time){
        return res.status(400).json({message: '名稱與電話還有預定日期為必填。'});
    }

    
    try {
        const result = await db.query (
            //SQL insert 結構 與JS無關
            'INSERT INTO `bookings` (`name`, `phone`, `booking_time`) VALUES (?, ?, ?)',
            [newUser.name, newUser.phone, newUser.booking_time]
        );
        //sql 輸出的是操作結果
        res.status(201).json({message: '預定成功', bookingId: result.insertId }); 
    } catch (error){
        console.error('新增預定時發生錯誤:', error);
        res.status(500).json({message: '內部伺服器錯誤，無法新增預定。'});
    }
});

// 拿來改SQL PUT PATCH用起來差不多
router.put('/:id', async (req, res) => {
    const bookingId = req.params.id;
    const updates = req.body;

    const allowedFields = ['customerName', 'customerPhone', 'booking_time', 'status'];
    const allowedStatus = ['pending', 'completed', 'cancelled']

    let setClauses = [];
    let queryParams = [];

    for (const key in updates){
        // 包含能改的 + 它內建有的屬性 才能改
        if (allowedFields.includes(key) && Object.prototype.hasOwnProperty.call(updates,key)){
            let dbFieldName = null;
            let dbValue = null;
            let isValidField = true; // 追蹤整段是否修改有效
            
            switch(key) {
                case 'customerName':
                    dbFieldName = 'name';
                    dbValue = updates[key];
                    break;
                case 'customerPhone':
                    dbFieldName = 'phone';
                    dbValue = updates[key];
                    break;
                case 'booking_time':
                    dbFieldName = 'booking_time';
                    dbValue = updates[key];
                    break;
                case 'status':
                    if (allowedStatus.includes(updates[key])){
                        dbFieldName = 'status';
                        dbValue = updates[key];
                        
                    }else {
                        console.warn(`status只有pending, completed, cancelled， 沒有 ${updates[key]}。`);
                        isValidField = false;
                    }
                    break;
                default:
                    //不應該到這
                    continue;
            }   
            // 為了SQL 語句 , 先寫下來後面直接join連接
            if (isValidField ){
                setClauses.push(`\`${dbFieldName}\` = ?`);
                queryParams.push(dbValue);
            }
        }else {
            console.warn(`嘗試更新不允許的字段或是無效字段: ${key}`);
            // 可在此選擇 400 Bad Request OR 忽略它
            // return res.status(400).json({message:`嘗試更新不允許的字段或是無效字段: ${key}`});
        }
    }
    // 沒更新內容, 返回錯誤
    if (setClauses.length == 0){
        return res.status(400).json({message: `沒有提供任何可更新的有效數據。`});
    }

    /*
     UPDATE table_name
    SET column1 = value1, column2 = value2, ...
    WHERE condition;
    condition => id = ?; 
    */
    queryParams.push(bookingId);
        
    try {
        const sql = `UPDATE bookings SET ${setClauses.join(', ')} WHERE id = ?`;
        console.log('生成的SQL:', sql);
        console.log('查詢參數:', queryParams);

        const result = await db.query(sql, queryParams);

        // affectedRows在檢查資料庫 UPDATE 操作的結果
        if (result.affectedRows === 0){
            return res.status(404).json({message: `找不到 ID 為 ${bookingId} 的預定， 或數據沒有變動。`});
        }
            
        res.json({message: `預定 ID: ${bookingId} 已成功更新。`});
    } catch (error) {
        console.error( `更新 ID: ${bookingId} 預定時發生錯誤:`, error);
        res.status(500).json({message: '內部伺服器錯誤，無法更新預定。'});
    }
    
});


router.delete('/:id', async (req, res) => {
    const bookingId = req.params.id;

    try {
        const result = await db.query('DELETE FROM bookings WHERE id = ?', [bookingId])

        //檢查有沒有刪除"行為"
        if (result.affectedRows === 0){
            return res.status(404).json({message: `找不到 ID: ${bookingId} 的預訂。` });
        }

        res.status(204).end();
    } catch{
        console.error( '刪除客戶資料時發生錯誤。');
        res.status(500).json({message: '內部伺服器錯誤，無法刪除。'});
    }
        
});

module.exports = router;

