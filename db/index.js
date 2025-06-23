
const mysql = require('mysql2/promise'); // promise for async/await 
const {Sequelize} = require('sequelize');

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: 'mysql',
        port: process.env.DB_PORT || 3306,
        logging: msg =>{
            //只輸出SQL與據
            if (msg.startsWith('Executing')){
                console.log(`[SQL] ${new Date().toISOString()} - ${msg}`);
            }
        },
        pool: {
            // 最多連結數
            max: 5,
            //最少空閒數
            min: 0,
            //獲取連結的最大等待時間(毫秒)
            acquire: 60000,
            //閒置狀態最大時間(毫秒)
            idle:60000
        },
        //舊版本MYSQL需要
        dialectOptions: {},
        timezone: '+08:00' // 台灣時區, 只在讀取時有用 存還是用不帶時區的UTC怕出錯
    }
);

async function initializeDb() {
    try {
        //嘗試連線, 會自動斷掉
        await sequelize.authenticate();
        // 生產環境中須考慮: migrations
        // 小專案可用 sync({force:true}) => 每次啟動會刪除並重建所有表
        
        await sequelize.sync();
        console.log('所有Sequelize模型已同步。')
        return true;
    } catch (err) {
        console.error ('無法建立資料庫連線:', err);
        process.exit(1); //直接離開 相對throw error少了些處理
    }
    


}


module.exports = {
    sequelize,
    initializeDb
};



