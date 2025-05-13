// routes/client/products.js
const express = require('express');
const router = express.Router();
const productController = require('../../controllers/client/productController');
// Không cần authenticate để xem danh sách và chi tiết sản phẩm

router.get('/', productController.index); // Danh sách sản phẩm (có thể lọc theo category, tìm kiếm)
router.get('/:id', productController.detail); // Chi tiết sản phẩm theo ID

module.exports = router;