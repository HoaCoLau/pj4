// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const db = require('../models');
const User = db.user;

exports.authenticate = async (req, res, next) => {
  const token = req.cookies.token; // Lấy token từ cookie

  if (!token) {
    // Nếu không có token, redirect về trang đăng nhập
    return res.redirect('/auth/login');
  }

  try {
    // Giải mã token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Tìm người dùng trong DB dựa trên ID từ token
    const user = await User.findByPk(decoded.id);

    if (!user) {
      // Nếu không tìm thấy user, xóa cookie và redirect
      res.clearCookie('token');
      return res.redirect('/auth/login');
    }

    // Gắn thông tin user vào request để các controller sau có thể sử dụng
    req.user = user;
    next(); // Cho phép request đi tiếp

  } catch (err) {
    // Lỗi giải mã token (token hết hạn, sai secret,...)
    res.clearCookie('token');
    res.redirect('/auth/login');
  }
};

exports.authorizeAdmin = (req, res, next) => {
  // Kiểm tra xem người dùng đã được xác thực và có vai trò là 'admin'
  if (req.user && req.user.role === 'admin') {
    next(); // Cho phép request đi tiếp
  } else {
    // Nếu không phải admin, trả về lỗi 403 Forbidden hoặc redirect
    res.status(403).send('Forbidden: Bạn không có quyền truy cập trang này.');
    // Hoặc: res.redirect('/');
  }
};

// Middleware để gắn thông tin user (nếu có) vào res.locals cho views
exports.attachUserToLocals = (req, res, next) => {
  res.locals.user = req.user || null; // Gắn req.user vào res.locals
  next();
};