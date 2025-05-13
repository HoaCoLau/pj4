// config/db.config.js
require('dotenv').config(); // Load biến môi trường từ .env
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'pj4',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10, // Số lượng kết nối tối đa trong pool
  queueLimit: 0 // Không giới hạn số lượng yêu cầu đợi kết nối
});

// Kiểm tra kết nối (tùy chọn)
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('MySQL Connected successfully!');
    connection.release(); // Trả kết nối về pool
  } catch (error) {
    console.error('Error connecting to MySQL:', error);
    process.exit(1); // Thoát nếu không kết nối được DB
  }
}

testConnection(); // Gọi hàm kiểm tra khi khởi động

module.exports = pool;