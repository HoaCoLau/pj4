const express = require('express');
require('dotenv').config();
const logger = require('./logger');
const app = express();
const cookieParser = require('cookie-parser');
const setUser = require('./middleware/setUser');

const methodOverride = require('method-override');
const authRoutes = require('./routes/authRoutes'); 
const bookRoutes = require('./routes/bookRoutes'); 
const userRoutes = require('./routes/userRoutes');
const genreRoutes = require('./routes/genreRoutes');

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Middleware
app.use(cookieParser());
app.use(setUser);
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static('public'));
app.use(methodOverride('_method'));


app.set('view engine', 'ejs');
app.set('views', './views');


// Routes
app.use('/', authRoutes);
app.use('/books', bookRoutes); 
app.use('/users', userRoutes);
app.use('/genres', genreRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Host: http://localhost:${PORT}`);
});
