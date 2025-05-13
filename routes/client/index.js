// routes/client/index.js
const express = require('express');
const router = express.Router();
const homeController = require('../../controllers/client/homeController');
// Không cần authenticate cho trang chủ

router.get('/', homeController.index); // Trang chủ

// Thêm các route client công khai khác ở đây nếu có
// Ví dụ: router.get('/about', clientController.showAboutPage);


module.exports = router;