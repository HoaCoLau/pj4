const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.get('/', (req, res) => {
  res.render('home');
  });
router.get('/login', (req, res) => {
  res.render('auth/login');
});


router.post('/login', authController.login);
router.post('/signup', authController.signup);
router.get('/signup', authController.CreateSignupForm);
router.get('/logout', authController.logout);


module.exports = router;