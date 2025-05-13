// routes/public/productRoutes.js
const express = require('express');
const router = express.Router();
const productController = require('../../controllers/public/productController'); // Đảm bảo file controller này tồn tại và export đúng hàm

// GET: Hiển thị danh sách tất cả sản phẩm cho người dùng công khai
// Ví dụ: /products?page=1&category=Ghế&search=gỗ&sort=price_asc
router.get('/', productController.showProductList); // productController.showProductList phải là một function

// GET: Hiển thị chi tiết một sản phẩm dựa trên ID
// Ví dụ: /products/123
router.get('/:id', productController.showProductDetail); // productController.showProductDetail phải là một function

module.exports = router; // Quan trọng: export router