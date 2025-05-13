// routes/admin/productRoutes.js
const express = require('express');
const productController = require('../../controllers/admin/productController');
const validate = require('../../middleware/validationMiddleware');
const productSchema = require('../../validation/productSchema');
const uploadMiddleware = require('../../middleware/uploadMiddleware'); // Middleware upload

const router = express.Router();

// GET: List products
router.get('/', productController.showProductsPage);
// GET: Show add product form
router.get('/add', productController.showAddProductForm);
// POST: Handle add product (Upload trước, validate sau)
router.post('/add', uploadMiddleware, validate(productSchema), productController.handleCreateProduct);
// GET: Show edit product form
router.get('/edit/:id', productController.showEditProductForm);
// POST: Handle update product (Upload trước, validate sau)
router.post('/edit/:id', uploadMiddleware, validate(productSchema), productController.handleUpdateProduct);
// POST: Handle delete product
router.post('/delete/:id', productController.handleDeleteProduct);

module.exports = router;