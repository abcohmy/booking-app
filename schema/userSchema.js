//joi schema驗證: 後端防線 在sequelize之前
//DB, sequelize自動加的像是 autoincrement/createdAt/updatedAt就不用joi驗證
const Joi = require('joi');

//messages內的錯誤內容須照joi內建的格式
const registerSchema = Joi.object({
    username: Joi.string().min(3).max(255).required().messages({
        'string.base': '使用者名稱必須是文字格式',
        'string.empty': '使用者名稱不能為空',
        'string.min': '使用者名稱最少要3個字元',
        'string.max': '使用者名稱最多不能超過255個字元',
        'any.required': '使用者名稱是必填欄位'
    }),

    password: Joi.string().min(8).max(255).required().messages({
        'string.base': '密碼必須是文字格式',
        'string.empty': '密碼不能為空',
        'string.min': '密碼最少要8個字元',
        'string.max': '密碼最多不能超過255個字元',
        'any.required': '密碼是必填欄位'
    }),

    role: Joi.string().valid('user', 'admin').default('user').messages({
        'any.only': '使用者類別(role)只能是user, admin'
    })
    

});

const loginSchema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required(),
});

module.exports = {loginSchema, registerSchema};