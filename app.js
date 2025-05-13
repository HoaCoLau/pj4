// app.js
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('pino-http')(); // Sử dụng pino-http cho Express
const db = require('./models'); // Import models/index.js
const { authenticate, authorizeAdmin, attachUserToLocals } = require('./middleware/authMiddleware'); // Import middleware xác thực và phân quyền
const dotenv = require('dotenv');
const fs = require('fs'); // Import fs để tạo thư mục upload
const expressEjsLayouts = require('express-ejs-layouts'); // Import thư viện

dotenv.config(); // Load biến môi trường

const app = express();



// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middleware
app.use(expressEjsLayouts); // Sử dụng middleware layout NGAY SAU cấu hình view engine
app.set('layout', 'layouts/main'); 
app.use(logger); // Pino logger (sử dụng pino-http)
app.use(express.json()); // Parse JSON request body
app.use(express.urlencoded({ extended: false })); // Parse URL-encoded request body
app.use(cookieParser()); // Parse cookies
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files

// Middleware để gắn thông tin user vào res.locals cho views, áp dụng cho mọi request
app.use(attachUserToLocals);


// Import routes
const authRouter = require('./routes/auth');
// Client routes
const clientIndexRoutes = require('./routes/client/index'); // Trang chủ
const clientProductRoutes = require('./routes/client/products'); // Danh sách/Chi tiết sản phẩm
const clientCartRoutes = require('./routes/client/cart'); // Giỏ hàng
const clientOrderRoutes = require('./routes/client/orders'); // Đơn hàng của user, Checkout

// Admin routes
const adminProductRoutes = require('./routes/admin/products');
const adminCategoryRoutes = require('./routes/admin/categories');
const adminUserRoutes = require('./routes/admin/users');
const adminOrderRoutes = require('./routes/admin/orders');


// Sử dụng routes

// Routes xác thực (không cần authenticate)
app.use('/auth', authRouter);

// Routes dành cho người dùng (client)
app.use('/', clientIndexRoutes); // Trang chủ và các route công khai khác
app.use('/products', clientProductRoutes); // Trang sản phẩm (công khai)
// Các route client cần đăng nhập sẽ áp dụng middleware `authenticate` trong file route tương ứng
app.use('/cart', clientCartRoutes); // Middleware `authenticate` được áp dụng trong routes/client/cart.js
app.use('/orders', clientOrderRoutes); // Middleware `authenticate` được áp dụng trong routes/client/orders.js


// Routes dành cho Admin
// Các route admin sẽ áp dụng cả authenticate và authorizeAdmin middleware trong từng file route
app.use('/admin/products', adminProductRoutes);
app.use('/admin/categories', adminCategoryRoutes);
app.use('/admin/users', adminUserRoutes);
app.use('/admin/orders', adminOrderRoutes);
// Thêm route cho trang dashboard admin nếu có
app.get('/admin', authenticate, authorizeAdmin, (req, res) => { // Có thể dùng '/admin' làm dashboard
    res.redirect('/admin/dashboard'); // Chuyển hướng tới dashboard
});
app.get('/admin/dashboard', authenticate, authorizeAdmin, (req, res) => {
    // Render trang dashboard admin
    res.render('admin/dashboard', { title: 'Dashboard Admin' }); // Cần tạo file views/admin/dashboard.ejs
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