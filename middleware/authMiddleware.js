    // middleware/authMiddleware.js
    const jwt = require('jsonwebtoken');
    const db = require('../models');
    const User = db.user;
    // const logger = require('../config/logger');

    // Middleware xác thực - Sửa để KHÔNG redirect nếu không có token
    exports.authenticate = async (req, res, next) => {
      const token = req.cookies.token; // Lấy token từ cookie

      // console.log('Authenticate Middleware: Token received:', token ? token.substring(0, 10) + '...' : 'No token'); // Log token (cắt bớt cho ngắn)

      if (!token) {
        // console.log('Authenticate Middleware: No token, continuing request.');
        req.user = null; // Đảm bảo req.user là null nếu không có token
        return next(); // Cho phép request đi tiếp ngay cả khi không có token
      }

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // console.log('Authenticate Middleware: Decoded token:', decoded); // Log payload token

        const user = await User.findByPk(decoded.id);
        // console.log('Authenticate Middleware: User found:', user ? user.email : 'None'); // Log user tìm được

        if (!user) {
          // console.log('Authenticate Middleware: User not found for token ID, clearing cookie.');
          res.clearCookie('token');
          req.user = null; // Đảm bảo req.user là null
          return next(); // Cho phép request đi tiếp (như user chưa đăng nhập)
        }

        req.user = user; // Gắn thông tin user vào request
        // console.log('Authenticate Middleware: req.user set for user:', req.user.email);
        next(); // Cho phép request đi tiếp

      } catch (err) {
        // Lỗi giải mã token (token hết hạn, sai secret,...)
        console.error('Authenticate Middleware: Token verification error:', err.message); // Log lỗi giải mã token
        res.clearCookie('token'); // Xóa cookie token lỗi
        req.user = null; // Đảm bảo req.user là null
        next(); // Cho phép request đi tiếp (như user chưa đăng nhập)
      }
    };

    // Middleware phân quyền Admin - Vẫn giữ nguyên logic chặn nếu không phải admin
    exports.authorizeAdmin = (req, res, next) => {
      // Kiểm tra xem người dùng đã được xác thực và có vai trò là 'admin'
      // req.user đã được set (hoặc là null) bởi middleware authenticate chạy trước đó
      if (req.user && req.user.role === 'admin') {
        next(); // Cho phép request đi tiếp
      } else {
        // Nếu không phải admin hoặc chưa đăng nhập, trả về lỗi 403 Forbidden
        // console.warn(`Authorization failed: User ${req.user ? req.user.id : 'None'} tried to access admin area.`);
        res.status(403).send('Forbidden: Bạn không có quyền truy cập trang này.');
        // Hoặc redirect về trang chủ: res.redirect('/');
      }
    };

    // Middleware để gắn thông tin user (nếu có) vào res.locals cho views
    // Middleware này sẽ chạy sau authenticate
    exports.attachUserToLocals = (req, res, next) => {
      // console.log('AttachUserToLocals Middleware: req.user:', req.user ? req.user.email : 'None'); // Log req.user
      res.locals.user = req.user; // Gắn req.user vào res.locals (req.user có thể là null)
      // console.log('AttachUserToLocals Middleware: res.locals.user set to:', res.locals.user ? res.locals.user.email : 'None'); // Log res.locals.user
      next();
    };
    