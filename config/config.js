// config/config.js
require('dotenv').config(); // Tải các biến từ file .env (nếu có, hữu ích cho local dev không dùng Docker)

module.exports = {
  development: {
    username: process.env.DB_USER || 'root',
    // Sử dụng null nếu DB_PASSWORD không được định nghĩa, vì Sequelize thường xử lý null tốt hơn cho mật khẩu rỗng.
    // Nếu MYSQL_ALLOW_EMPTY_PASSWORD=yes cho user root trong MySQL, mật khẩu rỗng/null sẽ hoạt động.
    password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : null,
    database: process.env.DB_NAME || 'pj4',
    host: process.env.DB_HOST || '127.0.0.1', // Sẽ được ghi đè bởi DB_HOST=db trong Docker
    dialect: 'mysql',
    logging: process.env.DB_LOGGING === 'true' || false, // Cho phép bật tắt logging qua biến môi trường
    pool: { // Cấu hình pool ví dụ, bạn có thể điều chỉnh
      max: process.env.DB_POOL_MAX ? parseInt(process.env.DB_POOL_MAX, 10) : 5,
      min: process.env.DB_POOL_MIN ? parseInt(process.env.DB_POOL_MIN, 10) : 0,
      acquire: process.env.DB_POOL_ACQUIRE ? parseInt(process.env.DB_POOL_ACQUIRE, 10) : 30000,
      idle: process.env.DB_POOL_IDLE ? parseInt(process.env.DB_POOL_IDLE, 10) : 10000
    }
  },
  // Bạn có thể thêm các môi trường khác ở đây, ví dụ 'production' hoặc 'docker'
  // Ví dụ, một môi trường 'docker' riêng biệt:
  docker: {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : null,
    database: process.env.DB_NAME || 'pj4',
    host: process.env.DB_HOST || 'db', // Mặc định host là 'db' cho Docker
    dialect: 'mysql',
    logging: process.env.DB_LOGGING === 'true' || false,
    pool: {
      max: process.env.DB_POOL_MAX ? parseInt(process.env.DB_POOL_MAX, 10) : 5,
      min: process.env.DB_POOL_MIN ? parseInt(process.env.DB_POOL_MIN, 10) : 0,
      acquire: process.env.DB_POOL_ACQUIRE ? parseInt(process.env.DB_POOL_ACQUIRE, 10) : 30000,
      idle: process.env.DB_POOL_IDLE ? parseInt(process.env.DB_POOL_IDLE, 10) : 10000
    }
  },
  production: {
    username: process.env.PROD_DB_USER,
    password: process.env.PROD_DB_PASSWORD,
    database: process.env.PROD_DB_NAME,
    host: process.env.PROD_DB_HOST,
    dialect: 'mysql',
    logging: false, // Thường tắt logging SQL ở production
    pool: {
      max: 10, // Ví dụ
      min: 1,
      acquire: 60000,
      idle: 20000
    }
  }
  // Bạn có thể xóa section "test" nếu không dùng, hoặc cấu hình tương tự.
};