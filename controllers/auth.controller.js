// controllers/auth.controller.js
const { User, Cart } = require('../models'); // Import từ models/index.js (Sequelize)
const jwt = require('jsonwebtoken');
const authConfig = require('../config/auth.config');
const logger = require('../config/logger.config');
const Joi = require('joi');

const registerSchema = Joi.object({
    name: Joi.string().min(3).max(255).required().messages({
        'string.base': 'Tên phải là một chuỗi',
        'string.empty': 'Tên không được để trống',
        'string.min': 'Tên phải có ít nhất {#limit} ký tự',
        'any.required': 'Tên là trường bắt buộc'
    }),
    email: Joi.string().email().required().messages({
        'string.email': 'Email không đúng định dạng',
        'string.empty': 'Email không được để trống',
        'any.required': 'Email là trường bắt buộc'
    }),
    password: Joi.string().min(6).required().messages({
        'string.empty': 'Mật khẩu không được để trống',
        'string.min': 'Mật khẩu phải có ít nhất {#limit} ký tự',
        'any.required': 'Mật khẩu là trường bắt buộc'
    })
});

const loginSchema = Joi.object({
    email: Joi.string().email().required().messages({
        'string.email': 'Email không đúng định dạng',
        'string.empty': 'Email không được để trống',
        'any.required': 'Email là trường bắt buộc'
    }),
    password: Joi.string().required().messages({
        'string.empty': 'Mật khẩu không được để trống',
        'any.required': 'Mật khẩu là trường bắt buộc'
    })
});

exports.showRegisterForm = (req, res) => {
    res.render('user/register', { title: 'Đăng ký', errors: null, formData: {} });
};

exports.register = async (req, res) => {
    const { error, value } = registerSchema.validate(req.body, { abortEarly: false });
    if (error) {
        const validationErrors = error.details.reduce((acc, current) => {
            acc[current.path[0]] = current.message;
            return acc;
        }, {});
        return res.status(400).render('user/register', {
            title: 'Đăng ký',
            errors: validationErrors,
            formData: value // Giữ lại dữ liệu người dùng đã nhập (trừ password)
        });
    }

    const { name, email, password } = value;
    try {
        const newUser = await User.create({ name, email, password, role: 'user' });
        if (newUser) {
            await Cart.create({ user_id: newUser.id }); // Tạo giỏ hàng cho user mới
        }

        const tokenPayload = { id: newUser.id, role: newUser.role, name: newUser.name };
        const token = jwt.sign(tokenPayload, authConfig.secret, { expiresIn: authConfig.expiresIn });
        const cookieMaxAge = authConfig.expiresIn.endsWith('h') ? parseInt(authConfig.expiresIn) * 60 * 60 * 1000 :
                             authConfig.expiresIn.endsWith('d') ? parseInt(authConfig.expiresIn) * 24 * 60 * 60 * 1000 :
                             60 * 60 * 1000; // Mặc định 1 giờ

        res.cookie('authToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: cookieMaxAge
        });

        logger.info(`User registered: ${email}`);
        req.flash('success_msg', 'Đăng ký thành công! Chào mừng bạn.');
        res.redirect('/');

    } catch (err) {
        logger.error('Error during registration:', err);
        let errorMessage = 'Đã có lỗi xảy ra trong quá trình đăng ký.';
        if (err.name === 'SequelizeUniqueConstraintError') {
            // err.errors là một mảng, phần tử đầu tiên thường chứa thông tin lỗi
            errorMessage = err.errors && err.errors.length > 0 ? err.errors[0].message : 'Email đã được sử dụng.';
        }
        res.status(500).render('user/register', {
            title: 'Đăng ký',
            errors: { general: errorMessage },
            formData: { name, email }
        });
    }
};

exports.showLoginForm = (req, res) => {
    res.render('user/login', { title: 'Đăng nhập', error: null, formData: {}, redirect: req.query.redirect });
};

exports.login = async (req, res) => {
    const { error, value } = loginSchema.validate(req.body);
    const redirectUrl = req.body.redirect || '/';

    if (error) {
        const validationError = error.details[0].message;
        return res.status(400).render('user/login', {
            title: 'Đăng nhập',
            error: validationError, // Hiển thị lỗi cụ thể từ Joi
            formData: { email: value.email }, // Giữ lại email
            redirect: redirectUrl
        });
    }

    const { email, password } = value;
    try {
        const user = await User.findOne({ where: { email: email } });
        if (!user) {
            return res.status(401).render('user/login', {
                title: 'Đăng nhập',
                error: 'Email hoặc mật khẩu không đúng.',
                formData: { email },
                redirect: redirectUrl
            });
        }

        const isMatch = await user.isValidPassword(password);
        if (!isMatch) {
            return res.status(401).render('user/login', {
                title: 'Đăng nhập',
                error: 'Email hoặc mật khẩu không đúng.',
                formData: { email },
                redirect: redirectUrl
            });
        }

        const tokenPayload = { id: user.id, role: user.role, name: user.name };
        const token = jwt.sign(tokenPayload, authConfig.secret, { expiresIn: authConfig.expiresIn });
        const cookieMaxAge = authConfig.expiresIn.endsWith('h') ? parseInt(authConfig.expiresIn) * 60 * 60 * 1000 :
                             authConfig.expiresIn.endsWith('d') ? parseInt(authConfig.expiresIn) * 24 * 60 * 60 * 1000 :
                             60 * 60 * 1000;

        res.cookie('authToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: cookieMaxAge
        });

        logger.info(`User logged in: ${email}`);
        req.flash('success_msg', 'Đăng nhập thành công!');

        if (user.role === 'admin') {
            res.redirect(redirectUrl.startsWith('/admin') ? redirectUrl : '/admin/dashboard');
        } else {
            // Không redirect đến trang admin nếu user thường cố tình nhập URL admin vào redirect
            if (redirectUrl.startsWith('/admin')) {
                res.redirect('/');
            } else {
                res.redirect(redirectUrl);
            }
        }

    } catch (err) {
        logger.error('Error during login:', err);
        res.status(500).render('user/login', {
            title: 'Đăng nhập',
            error: 'Đã có lỗi xảy ra, vui lòng thử lại.',
            formData: { email },
            redirect: redirectUrl
        });
    }
};

exports.logout = (req, res) => {
    res.clearCookie('authToken');
    logger.info('User logged out');
    req.flash('success_msg', 'Bạn đã đăng xuất.');
    res.redirect('/auth/login');
};