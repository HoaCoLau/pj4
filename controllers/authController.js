
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { createUserSchema } = require('../validation/userValidation');
const logger = require('../logger');
const bcrypt = require('bcrypt');
const saltRounds = 10;


exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      logger.warn('Login failed, user not found', { email });
      return res.status(401).render('auth/login', {
        error: 'Wrong email or password',
        oldInput: { email }
      });
    }
    const match = await bcrypt.compare(password, user.password);
    console.log('Login attempt:', { email, match, hashedPassword: user.password });

    if (!match) {
      logger.warn('Login failed, incorrect password', { email });
      return res.status(401).render('auth/login', {
        error: 'Wrong email or password',
        oldInput: { email }
      });
    }

    const token = jwt.sign({ id: user.id, email: user.email, name: user.name, role:user.role }, process.env.JWT_SECRET, { expiresIn: '5h' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    logger.info('User logined in', { user: user.email });
    res.redirect('/');
  } catch (err) {
    logger.error('Login error', { error: err.message });
    res.status(500).send('Internal Server Error');
  }
};

exports.CreateSignupForm = async (req, res) => {
  res.render('auth/signup', {  errorObj: {} });
};


exports.signup = async (req, res) => {
  const { error } = createUserSchema.validate(req.body, { abortEarly: false });

  if (error) {
    const errorObj = {};
    if (error.details && error.details.length) {
      error.details.forEach(err => {
        errorObj[err.path[0]] = err.message;
      });
    }
    return res.render('auth/signup', {
      errorObj,
      oldInput: req.body,
    });
  }

  try {
    const { email, name, password } = req.body;
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      const errorObj = { email: 'Email already exists.' };
      return res.render('auth/signup', {
        errorObj,
        oldInput: req.body,
      });
    }
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    await User.create({ email, name, password: hashedPassword });
    
    res.redirect('/login');
  } catch (err) {
    logger.error('Signup Error:', err);  
    console.error('Signup Error:', err);
    res.status(500).send('Error creating account');
  }
};
exports.logout = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  });
  logger.info('User logged out');
  res.redirect('/login');
};