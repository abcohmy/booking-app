const {DataTypes} = require('sequelize');
const {sequelize} = require('../db/index');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
    //即使sql有autoIncrement/primary/not null/default sequelize也需要再補一遍
    user_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },

    username: {
        type: DataTypes.STRING,
        //不能為NULL
        allowNull:false,
        unique:true,
        //資料完整性的後端防線
        validate:{
            //檢查是否為空字串'' DataTypes.STRING 用
            notEmpty: true
        }
    },

    password: {
        type: DataTypes.STRING, 
        allowNull:false,
        validate:{
            notEmpty: true
        }
    },

    role: {
        type: DataTypes.ENUM('user', 'admin'),
        defaultValue: 'user',
        allowNull: false
    }
}, {
    timestamps: true //自動添加createdAt, updatedAt欄位
});

/*
Sequelize Hook: 資料庫操作發生之前或之後執行自定義的function。Hook為生命週期。
    beforeCreate / afterCreate: 在創建記錄之前/之後。
    beforeUpdate / afterUpdate: 在更新記錄之前/之後。
    beforeDestroy / afterDestroy: 在刪除記錄之前/之後。
    beforeValidate / afterValidate: 在驗證模型資料之前/之後。
    還有連接層級的 Hook，如 beforeConnect / afterConnect 等。
    數據操作：在 before 類型的 Hook 中，你可以修改即將被操作的資料。例如，在 beforeCreate 中加密密碼。
    function處理：在 after 類型的 Hook 中，你可以執行與資料庫操作相關的function，例如發送通知、更新快取等。
*/

//創建密碼
User.beforeCreate(async (user, options) => {
    //回數越大越安全但消耗更多運算資源
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
});

/* 
bcrypt 密碼處理:
salt: Salt 是一個隨機生成的字串，與原始密碼混合後再進行hash運算(單向的加密運算)。

*/

User.prototype.matchPassword = async function(enterPassword){
    return await bcrypt.compare(enterPassword, this.password);
};

module.exports = User;
