
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
            acquire: 60000

        }
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0    
);
//pool只希望被建立一次, 建一次要很久
let pool;

async function initializeDb() {
    if (!pool){
        //建連線池
        pool = mysql.createPool(dbConfig);
        console.log('資料庫連線池已建立');
    }
    // 嘗試連接
    try {
        const connection = await pool.getConnection();
        connection.release();
        return true;
    } catch (err) {
        console.error ('無法建立資料庫連線:', err);
        throw err;
    }
    


}

async function  query(sql, params = []) {
    let connection; // finally要用到 寫外面
    try {
        connection = await pool.getConnection();
        //sql輸出的是操作結果
        const [rows] = await connection.execute(sql, params);
        return rows;
    } catch (error) {
        console.error('資料庫查詢錯誤:', error);
        throw error;
    // 執行完try/或跳error 都會執行finally 用在有跳躍式return, break, continue, goto等
    } finally {
        if (connection) connection.release();
    }
}

module.exports = {
    initializeDb, 
    query
};

