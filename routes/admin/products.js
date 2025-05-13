// routes/admin/products.js
const express = require('express');
const router = express.Router();
const productController = require('../../controllers/admin/productController');
const { authenticate, authorizeAdmin } = require('../../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

// Cấu hình Multer để lưu trữ file ảnh trong thư mục public/images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Đảm bảo thư mục tồn tại (có thể tạo bằng fs.mkdirSync nếu chưa có)
    const uploadPath = path.join(__dirname, '../../public/images/');
     fs.mkdir(uploadPath, { recursive: true }, (err) => { // Sử dụng fs.mkdir để tạo thư mục nếu chưa có
        if (err) console.error('Error creating upload directory:', err);
        cb(null, uploadPath);
     });
  },
  filename: function (req, file, cb) {
    // Đặt tên file duy nhất dựa trên timestamp và tên gốc
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });
const fs = require('fs'); // Import fs


// Áp dụng middleware xác thực và phân quyền admin cho tất cả route trong file này
router.use(authenticate);
router.use(authorizeAdmin);

// Routes CRUD cho Product
router.get('/', productController.index); // Danh sách
router.get('/create', productController.create); // Form thêm mới
router.post('/create', upload.single('image'), productController.store); // Xử lý thêm mới (có upload ảnh)
router.get('/edit/:id', productController.edit); // Form sửa
router.post('/edit/:id', upload.single('image'), productController.update); // Xử lý cập nhật (có upload ảnh)
router.post('/delete/:id', productController.delete); // Xử lý xóa

module.exports = router;