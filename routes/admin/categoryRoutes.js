// routes/admin/categoryRoutes.js
const express = require('express');
const categoryController = require('../../controllers/admin/categoryController');
const validate = require('../../middleware/validationMiddleware');
const categorySchema = require('../../validation/categorySchema');

const router = express.Router();

// GET routes
router.get('/', categoryController.showCategoriesPage);
router.get('/add', categoryController.showAddCategoryForm);
router.get('/edit/:id', categoryController.showEditCategoryForm);

// POST/PUT routes (Dùng POST cho cả update để đơn giản với form HTML)
router.post('/add', validate(categorySchema), categoryController.handleCreateCategory);
router.post('/edit/:id', validate(categorySchema), categoryController.handleUpdateCategory);

// DELETE route (Dùng POST)
router.post('/delete/:id', categoryController.handleDeleteCategory);

module.exports = router;