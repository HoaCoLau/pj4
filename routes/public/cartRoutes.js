// routes/public/cartRoutes.js
const express = require('express');
const cartController = require('../../controllers/public/cartController');
const { authenticateToken } = require('../../middleware/authMiddleware'); // Middleware kiểm tra đăng nhập

const router = express.Router();

// Áp dụng middleware check đăng nhập cho tất cả các route giỏ hàng
router.use(authenticateToken);

// GET: Hiển thị giỏ hàng
router.get('/', cartController.showCart);

// POST: Thêm sản phẩm vào giỏ
router.post('/add', cartController.addToCart);

// POST: Cập nhật số lượng sản phẩm (dùng ID của CartDetail)
router.post('/update/:cartDetailId', cartController.updateCartItem);

// POST: Xóa sản phẩm khỏi giỏ (dùng ID của CartDetail)
router.post('/remove/:cartDetailId', cartController.removeCartItem);

// Có thể thêm route POST /clear để xóa toàn bộ giỏ hàng nếu muốn

module.exports = router;