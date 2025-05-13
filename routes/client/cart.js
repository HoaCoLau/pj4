// routes/client/cart.js
const express = require('express');
const router = express.Router();
const cartController = require('../../controllers/client/cartController');
const { authenticate } = require('../../middleware/authMiddleware'); // Cần đăng nhập để xem giỏ hàng

// Áp dụng middleware xác thực cho tất cả route trong file này
router.use(authenticate);

// Routes cho Giỏ hàng
router.get('/', cartController.index); // Xem giỏ hàng
router.post('/add', cartController.addToCart); // Thêm sản phẩm vào giỏ hàng (Gửi từ form trên trang chi tiết sản phẩm)
router.post('/update/:id', cartController.updateCartItem); // Cập nhật số lượng item trong giỏ hàng (/:id là id của cartDetail)
router.post('/remove/:id', cartController.removeCartItem); // Xóa item khỏi giỏ hàng (/:id là id của cartDetail)

module.exports = router;