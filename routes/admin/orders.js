// routes/admin/orders.js
const express = require('express');
const router = express.Router();
const orderController = require('../../controllers/admin/orderController');
const { authenticate, authorizeAdmin , attachUserToLocals } = require('../../middleware/authMiddleware');

// Áp dụng middleware xác thực và phân quyền admin cho tất cả route trong file này
router.use(authenticate);
router.use(authorizeAdmin);
router.use(attachUserToLocals);

// Routes cho Order (Admin xem danh sách, chi tiết và cập nhật trạng thái, xóa)
router.get('/', orderController.index); // Danh sách đơn hàng
router.get('/detail/:id', orderController.detail); // Chi tiết đơn hàng
router.post('/update-status/:id', orderController.updateStatus); 

module.exports = router;