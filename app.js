// app.js
require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session'); // Cần cho connect-flash
const flash = require('connect-flash');   // Để hiển thị thông báo
const logger = require('./config/logger.config');
const authMiddleware = require('./middleware/auth.middleware');
const db = require('./models'); // Import Sequelize db setup từ models/index.js

const app = express();

// Session middleware (phải có TRƯỚC flash và các route dùng session)
app.use(session({
    secret: process.env.SESSION_SECRET || 'a_very_strong_and_long_secret_key_for_session',
    resave: false,
    saveUninitialized: true, // true để connect-flash hoạt động đúng khi chưa có session
    cookie: {
        secure: process.env.NODE_ENV === 'production', // Chỉ gửi cookie qua HTTPS ở production
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // Ví dụ: 1 ngày
    }
}));

// Flash messages middleware
app.use(flash());

// Middleware để truyền flash messages và user cho tất cả views
// Phải đặt SAU session và flash, TRƯỚC authMiddleware.verifyTokenAndAttachUser nếu muốn nó ghi đè
// hoặc đặt SAU authMiddleware.verifyTokenAndAttachUser để nó có thể dùng req.user
app.use((req, res, next) => {
    // Các biến này sẽ có sẵn trong tất cả các template EJS
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    // Có thể bạn cũng muốn truyền các loại flash khác nếu dùng (vd: 'info_msg')
    // currentUser và isLoggedIn sẽ được set bởi verifyTokenAndAttachUser
    next();
});


// Middleware cơ bản
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies
app.use(cookieParser()); // Parse cookies

// View Engine Setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static Files (CSS, JS client-side, images)
app.use(express.static(path.join(__dirname, 'public')));

// Request Logger (đơn giản)
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url} - IP: ${req.ip}`);
  next();
});

// Middleware xác thực token và gắn user vào request (CHẠY CHO MỌI REQUEST)
app.use(authMiddleware.verifyTokenAndAttachUser);

// --- Routes ---
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const adminRoutes = require('./routes/admin.routes');
// const cartRoutes = require('./routes/cart.routes'); // Sẽ tạo sau
// const orderRoutes = require('./routes/order.routes'); // Sẽ tạo sau

app.use('/auth', authRoutes);
app.use('/admin', authMiddleware.isLoggedIn, authMiddleware.isAdmin, adminRoutes); // Admin routes được bảo vệ
// app.use('/cart', isLoggedIn, cartRoutes); // Cart routes cần đăng nhập
// app.use('/orders', isLoggedIn, orderRoutes); // Order routes cần đăng nhập
app.use('/', userRoutes); // User routes (công khai và cần đăng nhập sẽ xử lý bên trong)


// --- Đồng bộ Database với Sequelize (CHỈ NÊN DÙNG CHO DEVELOPMENT) ---
if (process.env.NODE_ENV === 'development') {
    db.syncDb({ alter: true }) // { alter: true } cố gắng cập nhật bảng, { force: true } xóa và tạo lại
        .then(() => {
            logger.info("Development: Sequelize DB Sync completed (alter:true).");
            // (Tùy chọn) Seed data ở đây nếu database rỗng hoặc mới được tạo
        })
        .catch(err => {
            logger.error("Development: Sequelize DB Sync error:", err);
            // Có thể dừng server ở đây nếu DB sync thất bại và là điều kiện tiên quyết
            // process.exit(1);
        });
}
// --------------------------------------------------------------------

// 404 Error Handler (phải là middleware cuối cùng trước error handler chung)
app.use((req, res, next) => {
  res.status(404).render('user/error', { // Giả sử có view lỗi chung
      layout: 'user/layouts/main', // Nếu dùng layout
      title: '404 - Không tìm thấy trang',
      message: 'Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.'
  });
});

// General Error Handler (phải có 4 tham số: err, req, res, next)
app.use((err, req, res, next) => {
  logger.error({
      message: err.message,
      name: err.name,
      status: err.status || 500,
      stack: err.stack,
      url: req.originalUrl,
      method: req.method
  }, 'Unhandled application error');

  const status = err.status || 500;
  const message = err.message || 'Đã có lỗi xảy ra trên máy chủ.';

  res.status(status).render('user/error', { // View lỗi chung
    layout: 'user/layouts/main', // Nếu dùng layout
    title: `Lỗi ${status}`,
    message: (process.env.NODE_ENV === 'development' || status < 500) ? message : 'Đã có lỗi xảy ra, vui lòng thử lại sau.',
    // Chỉ hiển thị stack trace chi tiết ở development cho lỗi 500
    errorDetail: process.env.NODE_ENV === 'development' ? err.stack : null
  });
});

module.exports = app;   