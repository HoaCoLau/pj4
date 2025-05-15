// routes/admin/users.js
const express = require('express');
const router = express.Router();
const userController = require('../../controllers/admin/userController');
const { authenticate, authorizeAdmin , attachUserToLocals } = require('../../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs'); // Import fs


// Cấu hình Multer cho ảnh user (nếu có)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../../public/images/users/');
     fs.mkdir(uploadPath, { recursive: true }, (err) => {
        if (err) console.error('Error creating user upload directory:', err);
        cb(null, uploadPath);
     });
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });


// Áp dụng middleware xác thực và phân quyền admin cho tất cả route trong file này
router.use(authenticate);
router.use(authorizeAdmin);
router.use(attachUserToLocals);
// Routes cho User (Admin chỉ quản lý danh sách và sửa/xóa, không thêm mới qua admin panel)
router.get('/', userController.index); // Danh sách người dùng
router.get('/edit/:id', userController.edit); // Form sửa thông tin user (tên, role, ảnh?)
router.post('/edit/:id', upload.single('image'), userController.update); // Xử lý cập nhật thông tin user
router.post('/delete/:id', userController.delete); // Xử lý xóa người dùng

module.exports = router;