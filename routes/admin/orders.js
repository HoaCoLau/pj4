// routes/admin/orders.js
const express = require('express');
const router = express.Router();
const orderController = require('../../controllers/admin/orderController');
const { authenticate, authorizeAdmin } = require('../../middleware/authMiddleware');

// Áp dụng middleware xác thực và phân quyền admin cho tất cả route trong file này
router.use(authenticate);
router.use(authorizeAdmin);

// Routes cho Order (Admin xem danh sách, chi tiết và cập nhật trạng thái, xóa)
router.get('/', orderController.index); // Danh sách đơn hàng
router.get('/detail/:id', orderController.detail); // Chi tiết đơn hàng
router.post('/update-status/:id', orderController.updateStatus); // Cập nhật trạng thái đơn hàng
router.post('/delete/:id', orderController.delete); // Xóa đơn hàng (Cẩn thận!)

module.exports = router;