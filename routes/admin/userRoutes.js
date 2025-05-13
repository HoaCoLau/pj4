// routes/admin/userRoutes.js
const express = require('express');
const userController = require('../../controllers/admin/userController');
const validate = require('../../middleware/validationMiddleware');
const { updateUserSchema } = require('../../validation/userSchema'); // Chỉ cần schema update

const router = express.Router();

// GET: List users
router.get('/', userController.showUsersPage);
// GET: Show edit user form (chủ yếu sửa role)
router.get('/edit/:id', userController.showEditUserForm);
// POST: Handle update user
router.post('/edit/:id', validate(updateUserSchema), userController.handleUpdateUser);
// POST: Handle delete user
router.post('/delete/:id', userController.handleDeleteUser);

module.exports = router;