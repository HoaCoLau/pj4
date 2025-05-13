// routes/admin.routes.js
const express = require('express');
const router = express.Router();
const adminDashboardController = require('../controllers/admin/dashboard.controller');
const adminProductController = require('../controllers/admin/product.controller');
const adminCategoryController = require('../controllers/admin/category.controller');
const adminUserController = require('../controllers/admin/user.controller');
const adminOrderController = require('../controllers/admin/order.controller');
const upload = require('../middleware/upload.middleware'); // Middleware Multer

// Dashboard
router.get('/dashboard', adminDashboardController.getDashboardStats);
router.get('/', adminDashboardController.getDashboardStats); // Default admin route

// Product Routes
router.get('/products', adminProductController.getAllProducts);
router.get('/products/create', adminProductController.showCreateForm);
router.post('/products/create', upload.single('productImage'), adminProductController.createProduct);
router.get('/products/edit/:id', adminProductController.showEditForm);
router.post('/products/edit/:id', upload.single('productImage'), adminProductController.updateProduct);
router.post('/products/delete/:id', adminProductController.deleteProduct); // Nên dùng method DELETE

// Category Routes
router.get('/categories', adminCategoryController.getAllCategories);
router.get('/categories/form', adminCategoryController.showCategoryForm); // Form tạo mới
router.get('/categories/form/:id', adminCategoryController.showCategoryForm); // Form sửa
router.post('/categories/save', adminCategoryController.saveCategory); // Lưu (tạo mới)
router.post('/categories/save/:id', adminCategoryController.saveCategory); // Lưu (cập nhật)
router.post('/categories/delete/:id', adminCategoryController.deleteCategory); // Nên dùng method DELETE

// User Routes
router.get('/users', adminUserController.getAllUsers);
router.get('/users/edit/:id', adminUserController.showEditUserForm);
router.post('/users/edit/:id', adminUserController.updateUser);
router.post('/users/delete/:id', adminUserController.deleteUser); // Nên dùng method DELETE

// Order Routes
router.get('/orders', adminOrderController.getAllOrders);
router.get('/orders/detail/:id', adminOrderController.getOrderDetails);
router.post('/orders/update-status/:id', adminOrderController.updateOrderStatus);

module.exports = router;