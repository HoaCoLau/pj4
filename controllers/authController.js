// controllers/authController.js
const { User } = require('../models'); // Import User model từ models/index.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const logger = require('../config/logger'); // Pino logger
// const { validationResult } = require('express-validator'); // Không dùng nếu đã chuyển hẳn sang Joi

// Hiển thị trang đăng nhập
exports.showLoginPage = (req, res) => {
    // Middleware forwardAuthenticated đã kiểm tra và chuyển hướng nếu user đã đăng nhập
    res.render('auth/login', { // Render file views/auth/login.ejs
        pageTitle: 'Đăng Nhập',
        errors: req.validationErrors || null, // Lỗi Joi từ middleware validate (nếu có)
        formData: req.bodyInput || {},      // Dữ liệu form cũ (nếu có)
        path: '/auth/login',
        // Thêm query param 'registered' để hiển thị thông báo sau khi đăng ký thành công
        registered: req.query.registered === 'true'
    });
};

// Xử lý thông tin đăng nhập
exports.handleLogin = async (req, res, next) => {
    // Joi validation middleware (validate(loginSchema)) đã chạy trước
    if (req.validationErrors) {
        logger.warn('Login validation failed:', { errors: req.validationErrors, input: req.bodyInput });
        return res.status(400).render('auth/login', {
            pageTitle: 'Đăng Nhập',
            errors: req.validationErrors,
            formData: req.bodyInput, // Giữ lại dữ liệu đã nhập
            path: '/auth/login'
        });
    }

    const { email, password } = req.validatedBody || req.body; // Ưu tiên dữ liệu đã validate

    try {
        const user = await User.findOne({ where: { email: email } });

        if (!user || !(await user.isValidPassword(password))) {
            logger.warn(`Login attempt failed: Invalid credentials for ${email}`);
            return res.status(401).render('auth/login', { // 401 Unauthorized
                pageTitle: 'Đăng Nhập',
                errors: { general: 'Email hoặc mật khẩu không chính xác.' },
                formData: { email }, // Chỉ giữ lại email
                path: '/auth/login'
            });
        }

        // --- Credentials hợp lệ -> Tạo JWT ---
        const payload = {
            id: user.id,
            role: user.role,
            name: user.name // Thêm name vào payload để tiện hiển thị
        };

        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        // --- Gửi Token về Client qua HttpOnly Cookie ---
        res.cookie('token', token, {
            httpOnly: true, // Quan trọng: Ngăn JavaScript phía client truy cập cookie
            secure: process.env.NODE_ENV === 'production', // Chỉ gửi qua HTTPS ở production
            maxAge: parseInt(process.env.JWT_COOKIE_EXPIRES_IN, 10) || 3600000, // Thời gian cookie tồn tại (ms)
            // sameSite: 'strict' // Cân nhắc bật để tăng cường chống CSRF
        });

        logger.info(`User logged in successfully: ${email} (ID: ${user.id}, Role: ${user.role})`);

        // Chuyển hướng dựa trên vai trò
        if (user.role === 'admin') {
            res.redirect('/admin/dashboard');
        } else {
            res.redirect('/'); // Hoặc trang profile người dùng công khai
        }

    } catch (error) {
        logger.error({ err: error, emailAttempt: email }, 'Login system error');
        next(error); // Chuyển cho global error handler
    }
};

// Hiển thị trang đăng ký
exports.showRegisterPage = (req, res) => {
    // forwardAuthenticated middleware đã kiểm tra
    res.render('auth/register', { // Render file views/auth/register.ejs
        pageTitle: 'Đăng Ký Tài Khoản',
        errors: req.validationErrors || null, // Lỗi Joi (nếu có từ lần submit trước)
        formData: req.bodyInput || {},      // Dữ liệu form cũ (nếu có)
        path: '/auth/register'
    });
};

// Xử lý thông tin đăng ký
exports.handleRegister = async (req, res, next) => {
    // Joi validation middleware (validate(registrationSchema)) đã chạy trước
    if (req.validationErrors) {
         logger.warn('Registration validation failed:', { errors: req.validationErrors, input: req.bodyInput });
         return res.status(400).render('auth/register', {
             pageTitle: 'Đăng Ký Tài Khoản',
             errors: req.validationErrors,
             formData: req.bodyInput, // Giữ lại dữ liệu người dùng đã nhập
             path: '/auth/register'
         });
    }

    const { name, email, password } = req.validatedBody || req.body; // confirmPassword đã được Joi check

    try {
        // Kiểm tra email đã tồn tại hay chưa trong DB
        const existingUser = await User.findOne({ where: { email: email } });
        if (existingUser) {
             logger.warn(`Registration attempt failed: Email already exists - ${email}`);
             return res.status(400).render('auth/register', {
                 pageTitle: 'Đăng Ký Tài Khoản',
                 errors: { email: 'Địa chỉ email này đã được đăng ký.' }, // Lỗi cụ thể cho trường email
                 formData: { name, email }, // Giữ lại name và email
                 path: '/auth/register'
             });
        }

        // Tạo user mới (password sẽ tự động được hash bởi hook trong User model)
        await User.create({ name, email, password, role: 'user' }); // Mặc định role là 'user'
        logger.info(`New user registered: ${email}`);

        // Chuyển hướng về trang login với thông báo (qua query param)
        res.redirect('/auth/login?registered=true');

    } catch (error) {
        logger.error({ err: error, registrationData: { name, email } }, 'Registration system error');
        // Xử lý lỗi từ DB (ví dụ SequelizeUniqueConstraintError nếu có race condition)
         if (error.name === 'SequelizeUniqueConstraintError') {
              return res.status(400).render('auth/register', {
                 pageTitle: 'Đăng Ký Tài Khoản',
                 errors: { email: 'Địa chỉ email này đã được đăng ký (lỗi DB).' },
                 formData: { name, email },
                 path: '/auth/register'
             });
         }
        next(error);
    }
};

// Xử lý đăng xuất
exports.handleLogout = (req, res, next) => {
    const userId = req.user?.id; // Lấy ID trước khi xóa cookie (req.user có thể đã được gán bởi authenticateTokenForView)
    res.clearCookie('token'); // Xóa cookie chứa JWT
    // req.user và res.locals.currentUser sẽ tự động là null ở request tiếp theo
    // do authenticateTokenForView không tìm thấy token
    logger.info(`User logged out: ID ${userId || 'N/A'}`);
    res.redirect('/auth/login');
};