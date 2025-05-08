const db = require("../models");
const config = require("../config/auth.config");
const User = db.users;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { signupSchema, signinSchema } = require("../validation/auth.validation.js");
const logger = require('../config/logger'); 
exports.signupView = (req, res) => {
    res.render("user/auth/signup", { title: "Đăng ký" });
};

exports.signupProcess = (req, res) => {
  const { error, value } = signupSchema.validate(req.body, { abortEarly: false }); 
  if (error) {
    logger.warn(`Validation failed for signup: ${error.details.map(x => x.message).join(', ')}`);
    return res.redirect(`/auth/signup?error=${error.details[0].message}`);
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
             return res.redirect("/auth/signup?error=Email đã tồn tại.");
         }
        logger.error({ err }, "Lỗi khi đăng ký User.");
        res.redirect(`/auth/signup?error=${err.message || "Đã xảy ra lỗi khi đăng ký."}`);
    });
};

exports.signinView = (req, res) => {
    res.render("user/auth/signin", { title: "Đăng nhập" });
};

exports.signinProcess = (req, res) => {
   const { error, value } = signinSchema.validate(req.body, { abortEarly: false });

   if (error) {
       logger.warn(`Validation failed for signin: ${error.details.map(x => x.message).join(', ')}`);
       return res.redirect(`/auth/signin?error=${error.details[0].message}`);
   }

  User.findOne({ where: { email: value.email } }) 
    .then(user => {
      if (!user) {
          logger.warn(`Signin failed: User not found - ${value.email}`);
          return res.redirect("/auth/signin?error=User không tồn tại.");
      }

      const passwordIsValid = bcrypt.compareSync(value.password, user.password); 

      if (!passwordIsValid) {
          logger.warn(`Signin failed: Invalid password for user - ${value.email}`);
          return res.redirect("/auth/signin?error=Mật khẩu không đúng!");
      }

      const token = jwt.sign({ id: user.id }, config.secret, { algorithm: 'HS256', expiresIn: 86400 });
      res.cookie("token", token, { httpOnly: true });

      logger.info(`User signed in: ${user.email} (Role: ${user.role})`);

      if (user.role === 'admin') { res.redirect("/admin"); } else { res.redirect("/"); }
    })
    .catch(err => {
        logger.error({ err }, "Lỗi khi đăng nhập User.");
        res.redirect(`/auth/signin?error=${err.message || "Đã xảy ra lỗi khi đăng nhập."}`);
    });
};

exports.signout = (req, res) => {
    if (res.locals.user) {
        logger.info(`User signed out: ${res.locals.user.email}`);
    } else {
         logger.info(`User signed out (unknown user).`);
    }
    res.clearCookie("token");
    res.redirect("/auth/signin");
};