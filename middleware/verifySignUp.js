const db = require("../models");
const User = db.users;

checkDuplicateEmail = (req, res, next) => {
  User.findOne({
    where: {
      email: req.body.email
    }
  }).then(user => {
    if (user) {
      return res.redirect("/auth/signup?error=Email already exists");
    }
    next();
  });
};

const verifySignUp = {
  checkDuplicateEmail: checkDuplicateEmail
};

module.exports = verifySignUp;