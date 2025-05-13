// routes/auth.routes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// Hiển thị form đăng ký
router.get('/register', authController.showRegisterForm);

// Xử lý đăng ký
router.post('/register', authController.register);

// Hiển thị form đăng nhập
router.get('/login', authController.showLoginForm);

// Xử lý đăng nhập
router.post('/login', authController.login);

// Xử lý đăng xuất
router.get('/logout', authController.logout); // Dùng GET cho đơn giản, POST sẽ an toàn hơn nếu cần CSRF token

module.exports = router;