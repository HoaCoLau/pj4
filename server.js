// server.js
// Đây là file khởi tạo ứng dụng

// Import file ứng dụng chính
const app = require('./app');

// Import cấu hình database từ models/index.js để có thể đồng bộ nếu cần
const db = require('./models');

// Lấy port từ biến môi trường hoặc mặc định là 3000
const PORT = process.env.PORT || 3000;

// Đồng bộ model với database (chỉ chạy khi khởi tạo hoặc có thay đổi schema)
// Bạn có thể bỏ comment dòng này nếu muốn Sequelize tự tạo bảng khi chạy Docker lần đầu
// Cẩn thận khi sử dụng db.sequelize.sync({ force: true }) trong môi trường production vì nó sẽ xóa dữ liệu
db.sequelize.sync()
  .then(() => {
    console.log('Database synced.');
    // Khởi chạy server Express sau khi database đã đồng bộ
    app.listen(PORT, () => {
      console.log(`Server đang chạy trên http://localhost:${PORT}/`);
    });
  })
  .catch(err => {
    console.error('Lỗi đồng bộ database:', err);
    process.exit(1); // Thoát ứng dụng nếu không kết nối/đồng bộ được database
  });

// Bạn có thể thêm các logic khởi tạo khác ở đây nếu cần
