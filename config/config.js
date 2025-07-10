require('dotenv-flow').config();

module.exports = {
  "development": {
    "username": process.env.DB_USER || "root",
    "password": process.env.DB_PASSWORD || null,
    "database": process.env.DB_NAME || "database_development",
    "host":  process.env.DB_HOST || "127.0.0.1",
    "dialect": process.env.DB_DIALECT || "mysql"
  },
  "test": {
    "username": process.env.DB_USER || "root",
    "password": process.env.DB_PASSWORD || null,
    "database": process.env.DB_NAME || "database_test",
    "host": process.env.DB_HOST || "127.0.0.1",
    "dialect": process.env.DB_DIALECT || "sqlite::memory:"
  },
  "production": {
    "username": process.env.DB_USER,
    "password": process.env.DB_PASSWORD,
    "database": process.env.DB_NAME,
    "host": process.env.DB_HOST,
    "dialect": process.env.DB_DIALECT
  }
}
