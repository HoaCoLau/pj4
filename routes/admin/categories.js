// routes/admin/categories.js
const express = require('express');
const router = express.Router();
const categoryController = require('../../controllers/admin/categoryController');
const { authenticate, authorizeAdmin , attachUserToLocals } = require('../../middleware/authMiddleware');

// Áp dụng middleware xác thực và phân quyền admin cho tất cả route trong file này
router.use(authenticate);
router.use(authorizeAdmin);
router.use(attachUserToLocals);

// Routes CRUD cho Category
router.get('/', categoryController.index); // Danh sách
router.get('/create', categoryController.create); // Form thêm mới
router.post('/create', categoryController.store); // Xử lý thêm mới
router.get('/edit/:id', categoryController.edit); // Form sửa
router.post('/edit/:id', categoryController.update); // Xử lý cập nhật
router.post('/delete/:id', categoryController.delete); // Xử lý xóa

module.exports = router;