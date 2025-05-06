const express = require('express');
const router = express.Router();
const genreController = require('../controllers/genreController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { route } = require('./authRoutes');

router.use(authenticateToken);
router.get('/', genreController.getAllGenres);
router.get('/new', genreController.renderCreateGenreForm);
router.post('/', genreController.createGenre);
router.get('/:id', genreController.getGenreById);
router.get('/edit/:id', genreController.renderUpdateGenreForm);
router.put('/:id', genreController.updateGenre);
router.delete('/:id', genreController.deleteGenre);



module.exports = router;