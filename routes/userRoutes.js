const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { route } = require('./authRoutes');
const upload = require('../middleware/upload');

router.use(authenticateToken);
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserDetail);
router.get('/edit/:id', userController.editUserForm);
router.put('/:id', upload.single('image'), userController.editUser);





module.exports = router;