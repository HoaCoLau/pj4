// routes/user.routes.js
const express = require('express');
const router = express.Router();
const homeController = require('../controllers/user/home.controller');
const productController = require('../controllers/user/product.controller');
const cartController = require('../controllers/user/cart.controller');
const orderController = require('../controllers/user/order.controller');
const { isLoggedIn } = require('../middleware/auth.middleware'); // Middleware kiểm tra đăng nhập

// --- Public Routes ---
router.get('/', homeController.getHomePage);
router.get('/products', productController.getAllProducts);
router.get('/products/:id', productController.getProductById);

// --- Cart Routes (Cần đăng nhập) ---
router.get('/cart', isLoggedIn, cartController.getCart);
router.post('/cart/add/:productId', isLoggedIn, cartController.addToCart);
router.post('/cart/update/:cartDetailId', isLoggedIn, cartController.updateCartItem);
router.post('/cart/remove/:cartDetailId', isLoggedIn, cartController.removeCartItem); // Nên dùng DELETE

// --- Order Routes (Cần đăng nhập) ---
router.get('/checkout', isLoggedIn, orderController.showCheckoutPage);
router.post('/checkout', isLoggedIn, orderController.createOrder);
router.get('/orders', isLoggedIn, orderController.getUserOrders);
router.get('/orders/:id', isLoggedIn, orderController.getUserOrderDetail);

module.exports = router;