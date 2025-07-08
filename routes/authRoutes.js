const express = require('express');
const authRouter = express.Router();
const User = require('../models/userModel');

//schema:拒絕不合理的用戶輸入/減少DB負擔
const {loginSchema, registerSchema} = require('../schema/userSchema');

const {generateToken} = require('../utils/token');




authRouter.get('/check-username', async (req, res) => {
  try{
    const { username } = req.query;
    const existingUser = await User.findOne({where:{username}});
    res.json({available: !existingUser});
  } catch (error){
    console.error('查詢失敗:', error);
    res.status(500).json({message: '伺服器錯誤:' + error.message});
  }
});

// 註冊
authRouter.post('/register', async (req, res) => {
    const {error, value} = registerSchema.validate(req.body);
    
    if (error){
        return res.status(400).json({message: error.details[0].message});
    }

    const {username, password, role} = value;

    try {
        // findOne => 找尋資料庫內有沒有相同的名字
        const userExists = await User.findOne( {where: { username } });
        if (userExists){
            return res.status(400).json({message: '該使用者名稱已被使用。'});
        }

        // post => sequelize 的create 
        const user = await User.create({ username, password, role });

        //不回傳結果，用戶端會卡住loading
        return res.status(201).json({
            message: '使用者註冊成功。',
            user: { 
              user_id: user.user_id, 
              username: user.username, 
              role: 'user'}
        });

    } catch (error){
        console.error('註冊失敗:', error);
        res.status(500).json({message: '伺服器錯誤:' + error.message});
    }
});


//POST: 提交資料=>建立新資源/進行處理或操作
//改變伺服器狀態的應用post， GET用在沒有其他處理或操作的地方
authRouter.post('/login', async (req, res) => {
    const {error, value} = loginSchema.validate(req.body);
    
    if (error){
        return res.status(400).json({message: error.details[0].message})
    }
    //key 與變數(給value的變數)名稱一致，就能縮寫
    const { username, password} = value;
    try {
        //key 與變數(給value的變數)名稱一致，就能縮寫
        const user = await User.findOne( {where: { username }});

        if (!user) {
            return res.status(401).json({ message: '無效的帳號。' });
        }
        //matchPassword is in userModel
        if (await user.matchPassword(password)){
            res.status(200).json({
                message: '登入成功。',
                user: {
                user_id:user.user_id,
                username:user.username,
                role: user.role
                },
                token: generateToken(user.user_id, user.role)
            });
        } else{
            res.status(401).json({message: '無效的密碼'});
        }
    } catch (error) {
        console.error('登入失敗:', error);
        res.status(500).json({message: '伺服器錯誤:' + error.message});
    }


});


module.exports = {authRouter};

