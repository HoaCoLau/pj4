const express = require('express');
const router = express.Router(); // Phải khởi tạo router
const orderController = require('../../controllers/public/orderController'); // Đảm bảo controller được require đúng
const { authenticateToken } = require('../../middleware/authMiddleware'); // Middleware bảo vệ

// Áp dụng middleware check đăng nhập cho tất cả các route này
router.use(authenticateToken); // authenticateToken PHẢI là một function

// GET: Hiển thị lịch sử đơn hàng của user
// orderController.showUserOrders PHẢI là một function
router.get('/', orderController.showUserOrders);

// GET: Hiển thị chi tiết một đơn hàng của user
// orderController.showUserOrderDetail PHẢI là một function
router.get('/:id', orderController.showUserOrderDetail);

module.exports = router; // Rất quan trọng: Phải export router instance