// config/db.js
require('dotenv').config();
const { Sequelize } = require('sequelize');
const logger = require('./logger'); // Import logger để log lỗi kết nối

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 3306,
        dialect: 'mysql',
        // logging: process.env.NODE_ENV === 'development' ? console.log : false,
        logging: msg => logger.debug(msg), // Sử dụng Pino logger để log query ở level debug
        define: {
            // Quy ước đặt tên cột snake_case cho database
            underscored: true,
            // timestamps: true // Bật nếu muốn Sequelize tự quản lý createdAt/updatedAt
                               // Model sẽ tự ghi đè nếu cần (ví dụ Category không có timestamps)
        },
        pool: { // Cấu hình connection pool (tùy chọn nhưng nên có)
            max: 5, // Số kết nối tối đa
            min: 0, // Số kết nối tối thiểu
            acquire: 30000, // Timeout khi lấy kết nối (ms)
            idle: 10000 // Timeout khi kết nối nhàn rỗi (ms)
        }
    }
);

module.exports = sequelize;