// routes/admin/orderRoutes.js
const express = require('express');
const orderController = require('../../controllers/admin/orderController');
const validate = require('../../middleware/validationMiddleware');
const { updateOrderStatusSchema } = require('../../validation/orderSchema');

const router = express.Router();

// GET: List orders
router.get('/', orderController.showOrdersPage);
// GET: View order detail
router.get('/:id', orderController.showOrderDetailPage);
// POST: Update order status
router.post('/:id/update-status', validate(updateOrderStatusSchema), orderController.handleUpdateStatus);

module.exports = router;