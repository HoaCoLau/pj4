const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController'); 
const { authenticateToken } = require('../middleware/authMiddleware');
const { route } = require('./authRoutes');
const upload = require('../middleware/upload');
    

router.use(authenticateToken);
router.get('/', bookController.getAllBooks);
router.get('/new', bookController.CreateBookForm);
router.post('/', upload.single('image'), bookController.createBook);
router.get('/:id', bookController.getBookById);
router.get('/edit/:id', bookController.UpdateBookForm);
router.put('/:id', upload.single('image'), bookController.updateBook);
router.delete('/:id', bookController.deleteBook);

module.exports = router;