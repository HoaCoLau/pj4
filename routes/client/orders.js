// routes/client/orders.js
const express = require('express');
const router = express.Router();
const orderController = require('../../controllers/client/orderController');
const { authenticate , attachUserToLocals } = require('../../middleware/authMiddleware'); // Cần đăng nhập để xem giỏ hàng

// Áp dụng middleware xác thực cho tất cả route trong file này
router.use(authenticate);
router.use(attachUserToLocals);


// Routes cho Đơn hàng của người dùng
router.get('/', orderController.index); // Lịch sử đơn hàng

// Routes liên quan đến quá trình thanh toán/đặt hàng từ giỏ hàng
router.get('/checkout', orderController.showCheckout); // Trang thanh toán (Hiển thị thông tin từ giỏ hàng)
router.post('/checkout', orderController.createOrderFromCart);  // Xử lý tạo đơn hàng từ giỏ hàng
router.get('/:id', orderController.detail); // Chi tiết đơn hàng theo ID

module.exports = router;