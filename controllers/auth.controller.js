
const db = require("../models");
const config = require("../config/auth.config");
const User = db.users;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

exports.signupView = (req, res) => {
    const error = req.query.error;
    res.render("user/auth/signup", { title: "Đăng ký", error: error });
};

exports.signupProcess = (req, res) => {
  if (!req.body || !req.body.email || !req.body.password || !req.body.name) {
     return res.redirect("/auth/signup?error=Missing required fields");
  }
  User.create({
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 8),
    name: req.body.name,
    image: req.body.image,
    role: 'user'
  })
    .then(user => { res.redirect("/auth/signin?success=Registration successful"); })
    .catch(err => { res.redirect(`/auth/signup?error=${err.message || "Đã xảy ra lỗi khi đăng ký."}`); });
};

exports.signinView = (req, res) => {
    const error = req.query.error;
    const success = req.query.success;
    res.render("user/auth/signin", { title: "Đăng nhập", error: error, success: success });
};

exports.signinProcess = (req, res) => {
   if (!req.body || !req.body.email || !req.body.password) {
    return res.redirect("/auth/signin?error=Email and password are required");
  }
  User.findOne({ where: { email: req.body.email } })
    .then(user => {
      if (!user) { return res.redirect("/auth/signin?error=User not found"); }
      const passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
      if (!passwordIsValid) { return res.redirect("/auth/signin?error=Invalid password"); }
      const token = jwt.sign({ id: user.id }, config.secret, { algorithm: 'HS256', expiresIn: 86400 });
      res.cookie("token", token, { httpOnly: true });
      if (user.role === 'admin') { res.redirect("/admin"); } else { res.redirect("/"); }
    })
    .catch(err => { res.redirect(`/auth/signin?error=${err.message || "Đã xảy ra lỗi khi đăng nhập."}`); });
};

exports.signout = (req, res) => {
    res.clearCookie("token");
    res.redirect("/auth/signin");
};