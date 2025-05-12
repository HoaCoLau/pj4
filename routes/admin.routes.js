const express = require("express");
const { isAuthenticated, isAdminView } = require("../middleware/renderAuth");

const adminDashboardView = require("../controllers/admin/dashboard.controller.js");
const adminCategoryView = require("../controllers/admin/category.controller.js");
const adminProductView = require("../controllers/admin/product.controller.js");
const adminOrderView = require("../controllers/admin/order.controller.js");
const adminUserView = require("../controllers/admin/user.controller.js");

const router = express.Router();

router.use(isAuthenticated);
router.use(isAdminView);

// Trang Dashboard Admin
router.get("/", adminDashboardView.showDashboard);

// Routes quản lý Danh mục và xử lý form
router.get("/categories", adminCategoryView.listCategories);
router.get("/categories/create", adminCategoryView.createCategoryForm);
router.post("/categories", adminCategoryView.createCategoryProcess);
router.get("/categories/edit/:categoryId", adminCategoryView.editCategoryForm);
router.put("/categories/:categoryId", adminCategoryView.updateCategoryProcess); // Đổi từ POST sang PUT
router.delete("/categories/:categoryId", adminCategoryView.deleteCategoryProcess); // Đổi từ POST sang DELETE

// Routes quản lý Sản phẩm và xử lý form
router.get("/products", adminProductView.listProducts);
router.get("/products/create", adminProductView.createProductForm);
router.post("/products", adminProductView.createProductProcess);
router.get("/products/edit/:productId", adminProductView.editProductForm);
router.put("/products/:productId", adminProductView.updateProductProcess); // Đổi từ POST sang PUT, sửa URL
router.delete("/products/:productId", adminProductView.deleteProductProcess); // Đổi từ POST sang DELETE, sửa URL

// Routes quản lý Đơn hàng và xử lý form
router.get("/orders", adminOrderView.listOrders);
router.get("/orders/:orderId", adminOrderView.orderDetail);
router.put("/orders/update-status/:orderId", adminOrderView.updateOrderStatusProcess); // Giữ nguyên PUT cho update status
router.delete("/orders/:orderId", adminOrderView.deleteOrderProcess); // Đổi từ POST sang DELETE

// Routes quản lý Người dùng và xử lý form
router.get("/users", adminUserView.listUsers);
router.get("/users/:userId", adminUserView.userDetail);
router.get("/users/edit/:userId", adminUserView.editUserForm);
router.put("/users/:userId", adminUserView.updateUserProcess); // Đổi từ POST sang PUT
router.delete("/users/:userId", adminUserView.deleteUserProcess); // Đổi từ POST sang DELETE


module.exports = router;
