const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = req.cookies.token;
  if (token) {
    try {
      const verified = jwt.verify(token, process.env.JWT_SECRET);
      res.locals.user = verified;
      console.log('User set in res.locals:', verified);
    } catch (err) {
      res.locals.user = null;
    }
  } else {
    res.locals.user = null;
  }
  next();
};
