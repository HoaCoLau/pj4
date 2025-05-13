// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const logger = require('../config/logger');
const { User } = require('../models'); // Cần để lấy thông tin user đầy đủ nếu muốn

// --- Middleware chính để kiểm tra token cho các route cần bảo vệ ---
const authenticateToken = async (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        logger.warn('Authentication Required: No token cookie found.', { url: req.originalUrl });
        // Không redirect ngay lập tức, để controller quyết định hoặc trả lỗi 401/403
        // Nếu muốn redirect luôn về login:
        // req.flash is not available
        // return res.redirect('/auth/login');
        const err = new Error('Authentication required. Please log in.');
        err.statusCode = 401; // Unauthorized
        return next(err); // Gửi lỗi cho global error handler -> render trang lỗi
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Lấy thông tin user đầy đủ từ DB (tùy chọn, nhưng thường cần thiết)
        const user = await User.findByPk(decoded.id, {
            attributes: { exclude: ['password'] } // Không lấy mật khẩu
        });

        if (!user) {
             logger.warn(`Authentication Failed: User ID ${decoded.id} from token not found.`);
             res.clearCookie('token'); // Xóa cookie nếu user không tồn tại
             const err = new Error('Authentication failed.');
             err.statusCode = 401;
             return next(err);
        }

        // Gán user đầy đủ vào req để các controller sau có thể dùng
        req.user = user.get({ plain: true });
        // Gán vào res.locals để view cũng có thể dùng (nếu cần)
        res.locals.currentUser = req.user;


        next(); // Token hợp lệ và user tồn tại
    } catch (error) {
        logger.error('Authentication Failed: Invalid or expired token.', { error: error.message, token });
        res.clearCookie('token'); // Xóa cookie không hợp lệ
        const err = new Error('Authentication failed. Please log in again.');
        err.statusCode = 401;
        return next(err);
    }
};


// --- Middleware để kiểm tra token nhưng không chặn request ---
// Chỉ gán req.user/res.locals.currentUser nếu token hợp lệ
// Dùng trong app.js để mọi view đều có thể biết trạng thái đăng nhập
const authenticateTokenForView = async (req, res, next) => {
    const token = req.cookies.token;
    res.locals.currentUser = null; // Mặc định chưa đăng nhập cho view

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            // Lấy thông tin user từ DB để chắc chắn user còn tồn tại và có role đúng
            const user = await User.findByPk(decoded.id, {
                 attributes: ['id', 'name', 'email', 'role', 'image'] // Lấy các trường cần thiết cho view
            });
            if (user) {
                req.user = user.get({ plain: true }); // Gán vào req nếu cần dùng ở middleware sau
                res.locals.currentUser = req.user; // Gán vào res.locals cho EJS
            } else {
                 logger.warn(`View Authentication: User ID ${decoded.id} from token not found. Clearing cookie.`);
                 res.clearCookie('token'); // Xóa token nếu user không tồn tại
            }
        } catch (error) {
            // Token không hợp lệ/hết hạn -> không báo lỗi, coi như chưa đăng nhập
            logger.debug('View Authentication: Invalid or expired token found, ignoring.', { error: error.message });
            res.clearCookie('token'); // Xóa cookie không hợp lệ
        }
    }
    next(); // Luôn gọi next()
};


// --- Middleware kiểm tra quyền Admin ---
// Phải chạy SAU authenticateToken
const isAdmin = (req, res, next) => {
    // req.user đã được gán bởi authenticateToken
    if (req.user && req.user.role === 'admin') {
        return next(); // Là admin -> OK
    }
    logger.warn(`Authorization Failed: User ID ${req.user?.id} (${req.user?.role}) attempted admin access to ${req.originalUrl}`);
    const err = new Error('Forbidden: You do not have permission to access this resource.');
    err.statusCode = 403; // Forbidden
    next(err); // Gửi lỗi cho global error handler -> render trang lỗi 403
};

// --- Middleware chuyển hướng nếu đã đăng nhập ---
// Dùng cho trang Login/Register
const forwardAuthenticated = (req, res, next) => {
    // authenticateTokenForView đã chạy trước và gán req.user/res.locals.currentUser
    if (!res.locals.currentUser) {
       return next(); // Chưa đăng nhập -> cho vào trang login/register
    }
    // Đã đăng nhập -> chuyển hướng
    logger.debug(`User ID ${res.locals.currentUser.id} already logged in, forwarding from auth page.`);
    if (res.locals.currentUser.role === 'admin') {
       return res.redirect('/admin/dashboard');
    } else {
       return res.redirect('/'); // Chuyển về trang chủ người dùng
    }
};


module.exports = {
    authenticateToken,
    authenticateTokenForView,
    isAdmin,
    forwardAuthenticated
};