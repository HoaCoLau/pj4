const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const methodOverride = require("method-override");
const ejsMate = require('ejs-mate');
const pinoHttp = require('pino-http');
const logger = require('./config/logger');
require('dotenv').config();

const app = express();

app.use(pinoHttp({ logger: logger }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(methodOverride('_method'));

const setUserLocals = require('./middleware/setUserLocals');
app.use(setUserLocals);

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', './views');

app.use((req, res, next) => {
    res.locals.query = req.query;
    next();
});

app.use(express.static('public'));

const db = require("./models");

const publicRoutes = require("./routes/public.routes.js");
const authRoutes = require("./routes/auth.routes.js");
const userRoutes = require("./routes/user.routes.js");
const adminRoutes = require("./routes/admin.routes.js");

app.use("/", publicRoutes);
app.use("/auth", authRoutes);
app.use("/user", userRoutes); 
app.use("/admin", adminRoutes); 
app.use((req, res, next) => {
  req.log.warn(`404 Not Found: ${req.method} ${req.originalUrl}`);
  res.status(404).render("user/errorPage", { title: "Không tìm thấy trang", message: "Trang bạn yêu cầu không tồn tại." });
});

app.use((err, req, res, next) => {
  req.log.error({ err }, `Lỗi Server: ${err.message}`);
  res.status(500).render("user/errorPage", { title: "Lỗi Server", message: "Có lỗi xảy ra ở Server!" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Server đang chạy trên cổng ${PORT}: http://localhost:3000/`);
});