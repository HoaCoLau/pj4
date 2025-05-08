const express = require("express");
const { isAuthenticated } = require("../middleware/renderAuth"); // Chỉ cần isAuthenticated

const userCartView = require("../controllers/user/cart.controller.js"); // Đảm bảo đúng đường dẫn
const userOrderView = require("../controllers/user/order.controller.js"); // Đảm bảo đúng đường dẫn
const userProfileView = require("../controllers/user/profile.controller.js"); // Đảm bảo đúng đường dẫn

const router = express.Router(); // Tạo instance Router

// Áp dụng middleware isAuthenticated cho tất cả routes trong file này
router.use(isAuthenticated);

// Trang giỏ hàng và xử lý form
router.get("/cart", userCartView.viewCart);
router.post("/cart/add", userCartView.addItemToCartProcess);
router.post("/cart/update/:cartDetailId", userCartView.updateItemQuantityProcess); // Use POST with method-override PUT
router.post("/cart/remove/:cartDetailId", userCartView.removeItemFromCartProcess); // Use POST with method-override DELETE


// Trang đơn hàng của user và xử lý form
router.get("/orders", userOrderView.listOrders);
router.get("/orders/:orderId", userOrderView.orderDetail);
router.post("/orders", userOrderView.createOrderProcess); // Tạo đơn hàng


// Trang Profile user và xử lý form
router.get("/profile", userProfileView.viewProfile);
router.get("/profile/edit", userProfileView.editProfileForm);
router.post("/profile/edit", userProfileView.updateProfileProcess); // Use POST with method-override PUT

module.exports = router; // Export instance Router
