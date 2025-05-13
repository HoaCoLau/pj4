// routes/admin/index.js
const express = require('express');
const { authenticateToken, isAdmin } = require('../../middleware/authMiddleware'); // Middleware bảo vệ

// Import các sub-routers của admin
const categoryRoutes = require('./categoryRoutes');
const productRoutes = require('./productRoutes');
const userRoutes = require('./userRoutes');
const orderRoutes = require('./orderRoutes');
const logger = require('../../config/logger');

const router = express.Router();

// --- Áp dụng Middleware bảo vệ cho TOÀN BỘ các route trong file này ---
// Mọi request tới /admin/* sẽ phải đi qua các middleware này trước.
router.use(authenticateToken); // 1. Kiểm tra xem đã đăng nhập chưa (token hợp lệ)
router.use(isAdmin);         // 2. Kiểm tra xem user có phải là admin không

// --- Route cho trang Dashboard Admin ---
router.get('/dashboard', (req, res) => {
    // req.user đã được gán bởi authenticateToken
    logger.info(`Admin User ID ${req.user.id} accessed dashboard.`);
    res.render('admin/dashboard', {
        pageTitle: 'Admin Dashboard',
        // user: req.user // Truyền thông tin user vào view nếu cần
        path: '/admin/dashboard' // Cho active sidebar
    });
});

// --- Mount các Sub-Routers cho từng phần quản lý ---
// Các route trong categoryRoutes sẽ được gắn vào /admin/categories/*
router.use('/categories', categoryRoutes);
// Các route trong productRoutes sẽ được gắn vào /admin/products/*
router.use('/products', productRoutes);
// Các route trong userRoutes sẽ được gắn vào /admin/users/*
router.use('/users', userRoutes);
// Các route trong orderRoutes sẽ được gắn vào /admin/orders/*
router.use('/orders', orderRoutes);

// Có thể thêm một route mặc định cho /admin nếu /admin/dashboard không phải là trang đầu
// router.get('/', (req, res) => res.redirect('/admin/dashboard'));

module.exports = router;