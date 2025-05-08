const express = require("express");
const publicController = require("../controllers/user/public.controller.js"); // Đảm bảo đúng đường dẫn

const router = express.Router(); // Tạo instance Router

// Các trang View công khai
router.get("/", publicController.home);
router.get("/products", publicController.listProducts);
router.get("/products/:productId", publicController.productDetail);
router.get("/categories", publicController.listCategories);
// router.get("/about", publicController.about);
// router.get("/contact", publicController.contact);

module.exports = router; // Export instance Router
