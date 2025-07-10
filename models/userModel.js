const {DataTypes, Model} = require('sequelize');
const bcrypt = require('bcryptjs');
const { options } = require('joi');

class User extends Model {
 
  // 密碼加密策略：使用 bcrypt 的 salt 混合密碼後進行 hash（單向運算）
  async matchPassword(enterPassword){
    return bcrypt.compare(enterPassword, this.password);
  }

  // 操作 class 本身（非實例）的方法應使用 static，例如 initModel 註冊 schema

  static initModel(sequelize){
    //欄位定義
    return super.init ({
      // Sequelize 不會自動繼承 SQL 定義，需明確宣告欄位屬性（主鍵、長度、預設值等）

      user_id:{
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: true,
          len:[3, 255]
        }
      },

      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate:{
          notEmpty: true,
          len: [8,255]
        }
      },

      role: {
        type: DataTypes.STRING,
        defaultValue: 'user',
        allowNull: false,
        validate: {
          isIn: [['user', 'admin']]
        }
      }


    },{
      sequelize,
      modelName: 'User',
      tableName: 'users',
      timestamps: true,
            
      
      // 使用 beforeCreate hook，在儲存前將使用者密碼加密
      hooks: {
        beforeCreate: async (user, options) => {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      }
    });
  }
  // 使用者可擁有多筆預約紀錄（以 profile_id 為外鍵）
  static associate(models){
    this.hasMany(models.Booking, {foreignKey: 'profile_id'});
  }
}


module.exports = User;
