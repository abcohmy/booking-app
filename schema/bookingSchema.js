
const Joi = require('joi');

const bookingSchema = Joi.object({
    name: Joi.string().min(1).max(255).required().messages({
        'string.base': '預訂者名稱必須是文字格式',
        'string.empty': '預訂者姓名不能為空',
        'string.min': '預訂者姓名不能為空',
        'string.max': '預訂者名稱最多不能超過255個字元',
        'any.required': '預訂者名稱是必填欄位'
    }),

    phone: Joi.string().pattern(/^09[0-9]{8}$/).required().messages({
        'string.pattern.base': '手機號碼格式錯誤，必須09開頭共10碼數字',
        'any.required': '手機號碼必填欄位'
    }),

    booking_time: Joi.date().required().messages({
        'date.base': '預約時間必須是有效日期格式',
        'any.required' : '預約時間是必填欄位'
    }),
    status: Joi.string().valid('pending', 'completed', 'cancelled').default('pending').messages({
        'any.only': '狀態類別只能是 pending, completed, cancelled。'
    }),

    //使用者填寫的地方才需要報錯
    profile_id: Joi.number().integer().allow(null)
})

module.exports = {bookingSchema};