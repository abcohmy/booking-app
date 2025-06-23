
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const authMiddleware = async (req, res, next) =>{
    const authHeader = req.headers.authorization;
    /*
        若有Jwt認證request的header裡會有認證資訊, 而JWT開頭一般是Bearer
    */
    if (!authHeader || !authHeader.startsWith('Bearer ')){
        return res.status(401).json({message: '未授權，缺少格式錯誤的Token;'});
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        //用sequelize查詢用戶ID， 避免洩漏密碼所以指定不要回傳
        const user = await User.findByPk(decoded.user_id, {
            attributes: {exclude:['password']}
        });

        if (!user){
            return res.status(401).json({message: '用戶不存在，Token無效'});
        }

        req.user = user;
        //next是express內建請express執行下一個步驟
        //不用Express就會卡在那，需要繼續處理請求用
        next();
    } catch (error) {
        console.error('Token 驗證失敗:', error);
        return res.status(401).json({ message: '未授權，Token失效或錯誤' });
    }
};

// ...roles是 JS的剩餘參數語法，可塞任意參數使其成為一個陣列
const authorizeRoles = (...roles) => {
    //給router用的中介function所以以router內的req, res來當參數
    return (req, res, next) =>{
        //!req.user=>表沒過前面的authMiddleware認證
        //!roles.includes(req.user.role)=> 表非預設的使用者類別
        if (!req.user || typeof req.user.role !== 'string' || !roles.includes(req.user.role)){
            return res.status(403).josn({message: '禁止訪問: 您沒有此權限。'});
        }
        //next是express內建請express執行下一個步驟
        next();
    };

};

module.exports = {authMiddleware, authorizeRoles};