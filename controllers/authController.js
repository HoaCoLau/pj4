// controllers/authController.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const db = require('../models'); // Import db để truy cập models
const User = db.user;
const Cart = db.cart; // Import Cart model để tạo giỏ hàng khi đăng ký
// const logger = require('../config/logger'); // Nếu bạn đã cấu hình pino riêng

// Schema validation với Joi
const registerSchema = Joi.object({
  name: Joi.string().required().messages({
    'string.empty': 'Tên không được để trống.',
    'any.required': 'Tên là bắt buộc.'
  }),
  email: Joi.string().email().required().messages({
    'string.empty': 'Email không được để trống.',
    'string.email': 'Email không hợp lệ.',
    'any.required': 'Email là bắt buộc.'
  }),
  password: Joi.string().min(6).required().messages({
    'string.empty': 'Mật khẩu không được để trống.',
    'string.min': 'Mật khẩu phải có ít nhất {#limit} ký tự.',
    'any.required': 'Mật khẩu là bắt buộc.'
  }),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.empty': 'Email không được để trống.',
    'string.email': 'Email không hợp lệ.',
    'any.required': 'Email là bắt buộc.'
  }),
  password: Joi.string().required().messages({
    'string.empty': 'Mật khẩu không được để trống.',
    'any.required': 'Mật khẩu là bắt buộc.'
  }),
});

exports.showRegisterForm = (req, res) => {
  res.render('auth/register', { title: 'Đăng ký', error: null, oldInput: {} });
};

exports.register = async (req, res) => {
  const { error, value } = registerSchema.validate(req.body, { abortEarly: false });

  if (error) {
     const errors = error.details.map(detail => detail.message);
    return res.render('auth/register', { title: 'Đăng ký', error: errors, oldInput: req.body });
  }

  try {
    const { name, email, password } = value;

    // Kiểm tra email đã tồn tại chưa
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.render('auth/register', { title: 'Đăng ký', error: ['Email đã được sử dụng.'], oldInput: req.body });
    }

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo người dùng mới
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'user', // Mặc định là user
    });

    // Tạo giỏ hàng cho người dùng mới
    await Cart.create({ user_id: newUser.id });

    // logger.info(`User registered: ${newUser.email}`); // Ví dụ sử dụng logger

    // Redirect đến trang đăng nhập sau khi đăng ký thành công
    res.redirect('/auth/login?success=' + encodeURIComponent('Đăng ký thành công! Vui lòng đăng nhập.'));

  } catch (err) {
    console.error('Lỗi khi đăng ký:', err);
    // logger.error(`Registration error: ${err.message}`); // Ví dụ sử dụng logger
    res.render('auth/register', { title: 'Đăng ký', error: ['Có lỗi xảy ra. Vui lòng thử lại.'], oldInput: req.body });
  }
};

exports.showLoginForm = (req, res) => {
  res.render('auth/login', { title: 'Đăng nhập', error: req.query.error ? [req.query.error] : null, success: req.query.success });
};

exports.login = async (req, res) => {
  const { error, value } = loginSchema.validate(req.body, { abortEarly: false });

  if (error) {
      const errors = error.details.map(detail => detail.message);
    return res.render('auth/login', { title: 'Đăng nhập', error: errors });
  }

  try {
    const { email, password } = value;

    // Tìm người dùng theo email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.render('auth/login', { title: 'Đăng nhập', error: ['Email hoặc mật khẩu không đúng.'] });
    }

    // So sánh mật khẩu
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.render('auth/login', { title: 'Đăng nhập', error: ['Email hoặc mật khẩu không đúng.'] });
    }

    // Tạo JWT token
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '24h' }); // Token hết hạn sau 24 giờ

    // Lưu token vào cookie
    res.cookie('token', token, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 giờ
        // secure: process.env.NODE_ENV === 'production', // Chỉ dùng https trong production
        // sameSite: 'strict' // Bảo vệ CSRF
    });

    // logger.info(`User logged in: ${user.email}`); // Ví dụ sử dụng logger

    // Redirect dựa vào vai trò
    if (user.role === 'admin') {
      res.redirect('/admin/dashboard'); // Giả định có trang dashboard admin
    } else {
      res.redirect('/'); // Redirect về trang chủ người dùng
    }

  } catch (err) {
    console.error('Lỗi khi đăng nhập:', err);
    // logger.error(`Login error: ${err.message}`); // Ví dụ sử dụng logger
    res.render('auth/login', { title: 'Đăng nhập', error: ['Có lỗi xảy ra. Vui lòng thử lại.'] });
  }
};

exports.logout = (req, res) => {
  // logger.info(`User logged out: ${req.user ? req.user.email : 'Unknown'}`); // Ví dụ sử dụng logger
  // Xóa token khỏi cookie
  res.clearCookie('token');
  res.redirect('/auth/login?success=' + encodeURIComponent('Bạn đã đăng xuất.'));
};