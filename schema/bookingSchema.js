
const Joi = required('joi');

const bookingSchema = Joi.object({
    name: Joi.string().required.min(3).messages({
        'string.base': '使用者名稱必須是文字格式',
        'string.empty': '姓名不能為空',
        'string.min': '使用者名稱最少要3個字元',
        'string.max': '使用者名稱最多不能超過50個字元',
        'any.required': '使用者名稱是必填欄位'
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

Module.exports = {bookingSchema};