// app.js
require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const methodOverride = require('method-override');
const pinoHttp = require('pino-http');
const logger = require('./config/logger');
const sequelize = require('./config/db');

// Import Routes (sẽ tạo sau) - Tạm thời comment hoặc để trống
// const authRoutes = require('./routes/authRoutes');
// const adminRoutes = require('./routes/admin');
// const publicProductRoutes = require('./routes/public/productRoutes');
// const publicOrderRoutes = require('./routes/public/orderRoutes');
// const homeRoute = require('./routes/index');

// --- Express App Initialization ---
const app = express();

// --- Core Middleware ---
// Logger (Pino HTTP)
app.use(pinoHttp({ logger }));

// Cookie Parser
app.use(cookieParser());

// Static Files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Body Parsers
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Method Override
app.use(methodOverride('_method'));

// --- View Engine Setup ---
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


app.use((req, res, next) => {
    res.locals.currentUser = null;
    res.locals.path = req.path; // Vẫn cần path cho active menu
    next();
});



app.get('/', (req, res) => res.render('home', { pageTitle: 'Home' })); 
// app.use('/', homeRoute);
// app.use('/auth', authRoutes);
// app.use('/products', publicProductRoutes);
// app.use('/orders', publicOrderRoutes); // Cần auth
// app.use('/admin', /* require auth/admin middleware here */ adminRoutes);

// --- Error Handling ---
// 404 Not Found Handler
app.use((req, res, next) => {
    const error = new Error('Page Not Found');
    error.statusCode = 404;
    next(error);
});

// Global Error Handler
app.use((err, req, res, next) => {
  req.log.error({ err }, 'Unhandled error occurred'); // Log lỗi bằng logger của pino-http

  const statusCode = err.statusCode || 500;
  res.status(statusCode).render('error', {
    pageTitle: statusCode === 404 ? 'Not Found' : 'Error',
    errorCode: statusCode,
    errorMessage: process.env.NODE_ENV === 'production' && statusCode !== 404 ? 'An unexpected error occurred.' : err.message
  });
});

// --- Server & DB Connection ---
const PORT = process.env.PORT || 3000;

sequelize.authenticate()
  .then(() => {
    logger.info('Database connection established successfully.');
    app.listen(PORT, () => {
      logger.info(`Server running in ${process.env.NODE_ENV} mode on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    logger.fatal({ err }, 'Unable to connect to the database or start server.');
    process.exit(1);
  });