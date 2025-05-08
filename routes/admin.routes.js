const express = require("express");
const { isAuthenticated, isAdminView } = require("../middleware/renderAuth");

const adminDashboardView = require("../controllers/admin/dashboard.controller.js"); // Đảm bảo đúng đường dẫn
const adminCategoryView = require("../controllers/admin/category.controller.js"); // Đảm bảo đúng đường dẫn
const adminProductView = require("../controllers/admin/product.controller.js"); // Đảm bảo đúng đường dẫn
const adminOrderView = require("../controllers/admin/order.controller.js"); // Đảm bảo đúng đường dẫn
const adminUserView = require("../controllers/admin/user.controller.js"); // Đảm bảo đúng đường dẫn


const router = express.Router(); // Tạo instance Router

// Áp dụng middleware cho tất cả route trong file này
router.use(isAuthenticated);
router.use(isAdminView);

// Trang Dashboard Admin
router.get("/", adminDashboardView.showDashboard);

// Routes quản lý Danh mục và xử lý form
router.get("/categories", adminCategoryView.listCategories);
router.get("/categories/create", adminCategoryView.createCategoryForm);
router.post("/categories", adminCategoryView.createCategoryProcess);
router.get("/categories/edit/:categoryId", adminCategoryView.editCategoryForm);
router.post("/categories/edit/:categoryId", adminCategoryView.updateCategoryProcess); // Xử lý POST (PUT)
router.post("/categories/delete/:categoryId", adminCategoryView.deleteCategoryProcess); // Xử lý POST (DELETE)

// Routes quản lý Sản phẩm và xử lý form
router.get("/products", adminProductView.listProducts);
router.get("/products/create", adminProductView.createProductForm);
router.post("/products", adminProductView.createProductProcess);
router.get("/products/edit/:productId", adminProductView.editProductForm);
router.post("/products/edit/:productId", adminProductView.updateProductProcess);
router.post("/products/delete/:productId", adminProductView.deleteProductProcess);

// Routes quản lý Đơn hàng và xử lý form
router.get("/orders", adminOrderView.listOrders);
router.get("/orders/:orderId", adminOrderView.orderDetail);
router.post("/orders/update-status/:orderId", adminOrderView.updateOrderStatusProcess);
router.post("/orders/delete/:orderId", adminOrderView.deleteOrderProcess);

// Routes quản lý Người dùng và xử lý form
router.get("/users", adminUserView.listUsers);
router.get("/users/:userId", adminUserView.userDetail);
router.get("/users/edit/:userId", adminUserView.editUserForm);
router.post("/users/edit/:userId", adminUserView.updateUserProcess);
router.post("/users/delete/:userId", adminUserView.deleteUserProcess);


module.exports = router; // Export instance Router
