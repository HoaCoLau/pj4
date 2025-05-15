// routes/admin/products.js
const express = require('express');
const router = express.Router();
const productController = require('../../controllers/admin/productController');
// Không cần import middleware ở đây nữa
// const { authorizeAdmin } = require('../../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Sửa đường dẫn import models từ './models' thành '../../models'
const db = require('../../models'); // <-- Đã sửa đường dẫn

// Cấu hình Multer để lưu trữ file ảnh trong thư mục public/images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../../public/images/');
     fs.mkdir(uploadPath, { recursive: true }, (err) => {
        if (err) console.error('Error creating upload directory:', err);
        cb(null, uploadPath);
     });
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });


// XÓA DÒNG NÀY: router.use(authorizeAdmin);
// XÓA CÁC DÒNG router.use(authenticate); và router.use(attachUserToLocals); nếu có


// Routes CRUD cho Product
router.get('/', productController.index); // Danh sách
router.get('/create', productController.create); // Form thêm mới
router.post('/create', upload.single('image'), productController.store); // Xử lý thêm mới (có upload ảnh)
router.get('/edit/:id', productController.edit); // Form sửa
router.post('/edit/:id', upload.single('image'), productController.update); // Xử lý cập nhật (có upload ảnh)
router.post('/delete/:id', productController.delete); // Xử lý xóa

module.exports = router;
