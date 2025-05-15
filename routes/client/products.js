// routes/client/products.js
const express = require('express');
const router = express.Router();
const productController = require('../../controllers/client/productController');
const { authenticate , attachUserToLocals } = require('../../middleware/authMiddleware'); // Cần đăng nhập để xem giỏ hàng

// Áp dụng middleware xác thực cho tất cả route trong file này
router.use(authenticate);
router.use(attachUserToLocals);
// Không cần áp dụng middleware nào ở đây nữa vì authenticate và attachUserToLocals đã chạy toàn cục


router.get('/', productController.index); // Danh sách sản phẩm (có thể lọc theo category, tìm kiếm)
router.get('/:id', productController.detail); // Chi tiết sản phẩm theo ID

module.exports = router;