// config/sequelize.config.js
require('dotenv').config();
const { Sequelize } = require('sequelize');
const logger = require('./logger.config'); // Giả định bạn có file này

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT) || 3306,
        dialect: 'mysql',
        logging: (msg) => logger.debug(msg), // Hoặc true để log ra console, hoặc false để tắt
        pool: {
            max: 10,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        define: {
            timestamps: true, // Bật createdAt, updatedAt cho tất cả model (có thể override ở từng model)
            underscored: true, // Chuyển camelCase thành snake_case cho tên cột và bảng tự động
            // freezeTableName: true, // Nếu không muốn Sequelize tự động thêm 's' vào cuối tên model để tạo tên bảng
        }
    }
);

async function testSequelizeConnection() {
    try {
        await sequelize.authenticate();
        logger.info('Sequelize connection has been established successfully.');
    } catch (error) {
        logger.error('Unable to connect to the database via Sequelize:', error);
        process.exit(1);
    }
}

testSequelizeConnection();

module.exports = sequelize;