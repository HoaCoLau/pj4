// controllers/auth.controller.js
const db = require("../models");
const config = require("../config/auth.config");
const User = db.users;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { signupSchema, signinSchema } = require("../validation/auth.validation.js");
const logger = require('../config/logger');

// Render trang đăng ký
exports.signupView = (req, res) => {
    // error và success đã có trong res.locals.query
    req.log.debug('Rendering signup view');
    res.render("user/auth/signup", { title: "Đăng ký" });
};

// Xử lý submit form đăng ký (POST)
exports.signupProcess = (req, res) => {
  req.log.info('Processing signup form');
  const { error, value } = signupSchema.validate(req.body, { abortEarly: false });

  if (error) {
    logger.warn(`Validation failed for signup: ${error.details.map(x => x.message).join(', ')}`);
    const redirectParams = new URLSearchParams({ error: error.details[0].message });
    if (req.body.name) redirectParams.append('name', req.body.name);
    if (req.body.email) redirectParams.append('email', req.body.email);

    return res.redirect(`/auth/signup?${redirectParams.toString()}`);
  }

  User.create({
    email: value.email,
    password: bcrypt.hashSync(value.password, 8),
    name: value.name,
    image: value.image,
    role: value.role
  })
    .then(user => {
        logger.info(`New user signed up: ${user.email}`);
        res.redirect("/auth/signin?success=Registration successful");
    })
    .catch(err => {
         if (err.name === 'SequelizeUniqueConstraintError') {
             logger.warn(`Signup failed: Email already exists - ${value.email}`);
             const redirectParams = new URLSearchParams({ error: "Email đã tồn tại." });
             if (req.body.name) redirectParams.append('name', req.body.name);
             if (req.body.email) redirectParams.append('email', req.body.email);
             return res.redirect(`/auth/signup?${redirectParams.toString()}`);
         }
        logger.error({ err }, "Lỗi khi đăng ký User.");
         const redirectParams = new URLSearchParams({ error: err.message || "Đã xảy ra lỗi khi đăng ký." });
         if (req.body.name) redirectParams.append('name', req.body.name);
         if (req.body.email) redirectParams.append('email', req.body.email);
        res.redirect(`/auth/signup?${redirectParams.toString()}`);
    });
};

// Render trang đăng nhập
exports.signinView = (req, res) => {
    // error và success đã có trong res.locals.query
    req.log.debug('Rendering signin view');
    res.render("user/auth/signin", { title: "Đăng nhập" });
};

// Xử lý submit form đăng nhập (POST)
exports.signinProcess = (req, res) => {
   req.log.info('Processing signin form');
   const { error, value } = signinSchema.validate(req.body, { abortEarly: false });

   if (error) {
       logger.warn(`Validation failed for signin: ${error.details.map(x => x.message).join(', ')}`);
        const redirectParams = new URLSearchParams({ error: error.details[0].message });
        if (req.body.email) redirectParams.append('email', req.body.email);
       return res.redirect(`/auth/signin?${redirectParams.toString()}`);
   }

  User.findOne({ where: { email: value.email } })
    .then(user => {
      if (!user) {
          logger.warn(`Signin failed: User not found - ${value.email}`);
           const redirectParams = new URLSearchParams({ error: "User không tồn tại." });
           if (req.body.email) redirectParams.append('email', req.body.email);
          return res.redirect(`/auth/signin?${redirectParams.toString()}`);
      }

      const passwordIsValid = bcrypt.compareSync(value.password, user.password);

      if (!passwordIsValid) {
          logger.warn(`Signin failed: Invalid password for user - ${value.email}`);
           const redirectParams = new URLSearchParams({ error: "Mật khẩu không đúng!" });
           if (req.body.email) redirectParams.append('email', req.body.email);
          return res.redirect(`/auth/signin?${redirectParams.toString()}`);
      }

      const token = jwt.sign({ id: user.id }, config.secret, { algorithm: 'HS256', expiresIn: 86400 });
      res.cookie("token", token, { httpOnly: true });

      logger.info(`User signed in: ${user.email} (Role: ${user.role})`);

      if (user.role === 'admin') { res.redirect("/admin"); } else { res.redirect("/"); }
    })
    .catch(err => {
        logger.error({ err }, "Lỗi khi đăng nhập User.");
        const redirectParams = new URLSearchParams({ error: err.message || "Đã xảy ra lỗi khi đăng nhập." });
        if (req.body.email) redirectParams.append('email', req.body.email);
        res.redirect(`/auth/signin?${redirectParams.toString()}`);
    });
};

// Xử lý đăng xuất (GET hoặc POST)
exports.signout = (req, res) => {
    if (res.locals.user) {
        logger.info(`User signed out: ${res.locals.user.email}`);
    } else {
         logger.info(`User signed out (unknown user).`);
    }
    res.clearCookie("token");
    res.redirect("/auth/signin");
};
