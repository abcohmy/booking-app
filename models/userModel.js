const {DataTypes, Model} = require('sequelize');
const bcrypt = require('bcryptjs');
const { options } = require('joi');

class User extends Model {
  /* 
  bcrypt 密碼處理:
  salt: Salt 是一個隨機生成的字串，與原始密碼混合後再進行hash運算(單向的加密運算)。

  */

  //matchPassword是自己創的 所以要用prototype前綴表明是自創 然後才能給其他程式用
  // 因為用的是sequelize現成的class所以要加function只能外加

  async matchPassword(enterPassword){
    return bcrypt.compare(enterPassword, this.password);
  }

  //操作類別本體需用static
  static initModel(sequelize){
    //欄位定義
    return super.init ({
      //即使sql有autoIncrement/primary/not null/default sequelize也需要再補一遍
      user_id:{
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      /*
        //即使sql有autoIncrement/primary/not null/default sequelize也需要再補一遍
        //不能為NULL
        //資料完整性的後端防線
        //檢查是否為空字串'' DataTypes.STRING 用
      */
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
      hooks: {
        beforeCreate: async (user, options) => {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      }
    });
  }
  static associate(models){
    this.hasMany(models.Booking, {foreignKey: 'profile_id'});
  }
}


module.exports = User;
