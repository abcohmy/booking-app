const express = require('express');
const router = express.Router();
const jwt = requore('jsonwebtoken');
const User = require('../models/userModel');

//schema:拒絕不合理的用戶輸入/減少DB負擔
const {registerSchema} = require('../schema/userSchema');

/* JSON Web Token : 無狀態 (stateless) 的身份驗證/有狀態的話會需要多存很多用戶資訊
    {user_id, role} => 看該token包含哪些資訊 此範例設定在User裡
    process.env.JWT_SECRET => 在伺服器設定(.env2等)的金鑰, 會被jwt.sign()生成JWT字串, 
        加這串是保護驗證安全, 不然別人有相同的其他資訊就能偽造任意身分
    { expiresIn: '1h' } => 一小時候token 過期
*/

const generateToken = (user_id, role) => {
    return jwt.sign({user_id, role}, process.env.JWT_SECRET, {
        expiresIn: '1h'
    });
};

// 註冊
router.post('/register', async (req, res) => {
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
    } catch (error){
        console.error('註冊失敗:', error);
        res.status(500).json({message: '伺服器錯誤:' + error.message});
    }
});


//POST: 提交資料=>建立新資源/進行處理或操作
//改變伺服器狀態的應用post， GET用在沒有其他處理或操作的地方
router.post('/login', async (req, res) => {
    const {error, value} = registerSchema.validate(req.body);
    
    if (error){
        return res.status(400).json({message: error.details[0].message})
    }

    const { username, password} = value;
    try {
        const user = await User.findOne( {where: { username }});

        if (!user) {
            return res.status(401).json({ message: '無效的帳號。' });
        }
        //matchPassword is in userModel
        if (await user.matchPassword(password)){
            res.json({
                user_id:user.user_id,
                role: user.role,
                token: generateToken(user.user_id, user.role)
            });
        } else{
            res.status(401).json({message: '無效的密碼'});
        }
    } catch (error) {
        console. error('登入失敗:', error);
        res.status(500).json({message: '伺服器錯誤:' + error.message});
    }


});

module.exports = router;

// 寫完authRoutes 回去把認證軟體寫好 authMiddleware...後面再改bookingRoutes (記得把schema補上)