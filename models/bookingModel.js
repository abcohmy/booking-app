const {DataTypes} = require('sequelize');
const {sequelize} = require('../db/index');
const User = require('./userModel');

const Booking = sequelize.define('Booking', {
    booking_id: {
        type: DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },
    name : {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty:true
        }
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: false,
        validate:{
            is: /09[0-9]{8}/ // 手機格式認證
        }
    },

    booking_time: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
            isDate: true
        }
    },

    status: {
        type: DataTypes.ENUM('pending', 'completed', 'cancelled'),
        defaultValue: 'pending',
        allowNull:false
    },

    //繼承userModel的 user_id
    profile_id: {
        type: DataTypes.INTEGER,
        references:{
            model: User,
            key: 'user_id'
        },
        allowNull : true
    }
}, {
        timestamps: true
});

//有foreignKey(此是profile_id = user_id)用
Booking.belongsTo(User, {foreignKey: 'userId'});

module.exports = Booking;