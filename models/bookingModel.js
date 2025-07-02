const { Model, DataTypes } = require('sequelize');

class Booking extends Model {
  static initModel(sequelize) {
    //super = model super.init = model.init
    return super.init({
      booking_id: {
        type: DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
      },
      name : {
          type: DataTypes.STRING,
          allowNull: false,
          validate: {
              notEmpty:true,
              len: [1, 255]
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
        type: DataTypes.STRING,
        defaultValue: 'pending',
        allowNull:false,
        validate: {
          isIn: [['pending', 'completed', 'cancelled']]
        }
    },

    //繼承userModel的 user_id
    profile_id: {
        type: DataTypes.INTEGER,
        
        allowNull : true
    }
  }, {
    sequelize,
    modelName: 'Booking',
    tableName: 'bookings',
    timestamps: true
  });
    
  }
  static associations(models) {
    this.belongsTo(models.User, {
      foreignKey: 'profile_id',
      as: 'user'
    });
  }
}
    
    


module.exports = Booking;