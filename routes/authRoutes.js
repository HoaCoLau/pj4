// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController'); // Controller xử lý logic xác thực
const { forwardAuthenticated } = require('../middleware/authMiddleware'); // Middleware để chuyển hướng nếu đã đăng nhập
const validate = require('../middleware/validationMiddleware'); // Middleware validate chung sử dụng Joi
const { registrationSchema, loginSchema } = require('../validation/userSchema'); // Joi schemas cho đăng ký và đăng nhập

// GET: Hiển thị trang đăng nhập
// forwardAuthenticated sẽ kiểm tra nếu user đã login thì redirect đi
router.get('/login', forwardAuthenticated, authController.showLoginPage);

// POST: Xử lý thông tin đăng nhập từ form
// forwardAuthenticated cũng được dùng ở đây để nếu user cố tình POST khi đã login thì vẫn redirect
// validate(loginSchema) sẽ kiểm tra req.body trước khi authController.handleLogin được gọi
router.post('/login', forwardAuthenticated, validate(loginSchema), authController.handleLogin);

// GET: Hiển thị trang đăng ký
router.get('/register', forwardAuthenticated, authController.showRegisterPage);

// POST: Xử lý thông tin đăng ký từ form
// validate(registrationSchema) sẽ kiểm tra req.body trước khi authController.handleRegister được gọi
router.post('/register', forwardAuthenticated, validate(registrationSchema), authController.handleRegister);

// GET: Xử lý đăng xuất
// Không cần forwardAuthenticated ở đây vì user phải đăng nhập mới logout được
// Middleware authenticateToken sẽ được áp dụng ở controller hoặc ở đây nếu cần kiểm tra user trước khi logout
router.get('/logout', authController.handleLogout); // Thông thường GET cho logout là đủ cho server-rendered app
                                                  // Nếu muốn bảo mật hơn có thể dùng POST và CSRF token

module.exports = router;