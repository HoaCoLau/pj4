// routes/public/orderRoutes.js
const express = require('express');
const router = express.Router();
const orderController = require('../../controllers/public/orderController');
const { authenticateToken } = require('../../middleware/authMiddleware');

router.use(authenticateToken);

router.get('/', orderController.showUserOrders);
router.get('/:id', orderController.showUserOrderDetail);
// router.post('/:id/cancel', orderController.handleCancelOrder); // Nếu có

module.exports = router;