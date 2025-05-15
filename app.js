// app.js
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('pino-http')(); // Sử dụng pino-http cho Express
const db = require('./models'); // Import models/index.js
// Import authenticate, authorizeAdmin, attachUserToLocals
const { authenticate, authorizeAdmin, attachUserToLocals } = require('./middleware/authMiddleware');
const dotenv = require('dotenv');
const fs = require('fs'); // Import fs để tạo thư mục upload
const expressEjsLayouts = require('express-ejs-layouts'); // Import thư viện

dotenv.config(); // Load biến môi trường

const app = express();

// Đồng bộ model với database (chỉ chạy khi khởi tạo hoặc có thay đổi schema)
// db.sequelize.sync()
//   .then(() => {
//     console.log('Kết nối database thành công và đồng bộ models.');
//   })
//   .catch(err => {
//     console.error('Lỗi kết nối database:', err);
//   });

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middleware
app.use(expressEjsLayouts); // Sử dụng middleware layout NGAY SAU cấu hình view engine
app.set('layout', 'layouts/main');
app.use(logger); // Pino logger
app.use(express.json()); // Parse JSON request body
app.use(express.urlencoded({ extended: false })); // Parse URL-encoded request body
app.use(cookieParser()); // Parse cookies
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files


// Import routes
const authRouter = require('./routes/auth');
// Client routes
const clientIndexRoutes = require('./routes/client/index');
const clientProductRoutes = require('./routes/client/products');
const clientCartRoutes = require('./routes/client/cart');
const clientOrderRoutes = require('./routes/client/orders');
console.log('clientOrderRoutes loaded:', clientOrderRoutes);
// Admin routes
const adminProductRoutes = require('./routes/admin/products');
const adminCategoryRoutes = require('./routes/admin/categories');
const adminUserRoutes = require('./routes/admin/users');
const adminOrderRoutes = require('./routes/admin/orders');


// Sử dụng routes

// Routes xác thực (không cần authenticate ở đây)
app.use('/auth', authRouter);

// Routes dành cho người dùng (client)
// Áp dụng attachUserToLocals cho các route công khai để có thể hiển thị tên user nếu đăng nhập
app.use('/', attachUserToLocals, clientIndexRoutes);
app.use('/products', attachUserToLocals, clientProductRoutes);

// Các route client cần đăng nhập - Áp dụng authenticate và attachUserToLocals
app.use('/cart', authenticate, attachUserToLocals, clientCartRoutes);
app.use('/orders', authenticate, attachUserToLocals, clientOrderRoutes);


// Routes dành cho Admin - Áp dụng authenticate, authorizeAdmin, và attachUserToLocals
app.use('/admin/products', authenticate, authorizeAdmin, attachUserToLocals, adminProductRoutes);
app.use('/admin/categories', authenticate, authorizeAdmin, attachUserToLocals, adminCategoryRoutes);
app.use('/admin/users', authenticate, authorizeAdmin, attachUserToLocals, adminUserRoutes);
app.use('/admin/orders', authenticate, authorizeAdmin, attachUserToLocals, adminOrderRoutes);

// Route cho trang dashboard admin
app.get('/admin', authenticate, authorizeAdmin, attachUserToLocals, (req, res) => {
    res.redirect('/admin/dashboard');
});
app.get('/admin/dashboard', authenticate, authorizeAdmin, attachUserToLocals, (req, res) => {
    res.render('admin/dashboard', { title: 'Dashboard Admin' });
});


// Catch 404 and forward to error handler
app.use(function(req, res, next) {
  res.status(404).send('Không tìm thấy trang!'); // Hoặc render view 404
});

// Error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  console.error('App Error:', err.stack); // Log lỗi chi tiết trên console server

  // render the error page
  res.status(err.status || 500);
  res.send('Có lỗi xảy ra ở máy chủ! Vui lòng thử lại sau.'); // Hoặc render view error
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server đang chạy trên http://localhost:${PORT}/`);
});

module.exports = app;
