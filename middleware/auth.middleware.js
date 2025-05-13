// middleware/auth.middleware.js
const jwt = require('jsonwebtoken');
const authConfig = require('../config/auth.config');
const logger = require('../config/logger.config');
const { User } = require('../models'); // Import User từ models/index.js (Sequelize)

const verifyTokenAndAttachUser = async (req, res, next) => {
    const token = req.cookies.authToken;

    if (!token) {
        res.locals.isLoggedIn = false; // Cho views biết là chưa đăng nhập
        return next();
    }

    try {
        const decoded = jwt.verify(token, authConfig.secret);
        const currentUser = await User.findByPk(decoded.id, {
            attributes: ['id', 'email', 'name', 'image', 'role'] // Chỉ lấy các trường cần thiết
        });

        if (!currentUser) {
            res.clearCookie('authToken');
            res.locals.isLoggedIn = false;
            return next();
        }

        req.user = currentUser.toJSON(); // Gắn user (plain object) vào request
        res.locals.currentUser = req.user; // Cho views
        res.locals.isLoggedIn = true;

        logger.debug(`User authenticated: ${req.user.email} (ID: ${req.user.id})`);
        next();
    } catch (err) {
        logger.warn('JWT Verification Error:', err.message); // Warn thay vì error cho lỗi token
        res.clearCookie('authToken');
        res.locals.isLoggedIn = false;
        return next(); // Vẫn cho đi tiếp, các route sau sẽ kiểm tra req.user
    }
};

const isLoggedIn = (req, res, next) => {
    if (!req.user || !res.locals.isLoggedIn) {
        logger.warn('Unauthorized access attempt to protected route by guest.');
        req.flash('error_msg', 'Vui lòng đăng nhập để xem trang này.'); // Dùng connect-flash
        // Lưu lại URL muốn truy cập để redirect sau khi đăng nhập
        const redirectTo = req.originalUrl === '/auth/logout' ? '/' : req.originalUrl;
        return res.redirect(`/auth/login?redirect=${encodeURIComponent(redirectTo)}`);
    }
    next();
};

const isAdmin = (req, res, next) => {
    // Middleware này nên chạy SAU isLoggedIn
    if (!req.user || req.user.role !== 'admin') {
        logger.warn(`Forbidden access attempt by non-admin user: ${req.user ? req.user.email : 'Unknown'}`);
        req.flash('error_msg', 'Bạn không có quyền truy cập trang này.');
        return res.status(403).redirect('/'); // Hoặc render trang lỗi 403
    }
    next();
};

module.exports = {
    verifyTokenAndAttachUser,
    isLoggedIn,
    isAdmin
};