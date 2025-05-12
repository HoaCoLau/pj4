// middleware/setUserLocals.js
const jwt = require('jsonwebtoken');
const db = require('../models');
const User = db.users;
const config = require('../config/auth.config');
const logger = require('../config/logger'); 

module.exports = (req, res, next) => {
  const token = req.cookies.token;

  if (token) {
    jwt.verify(token, config.secret, (err, decoded) => {
        if (err) {
            res.locals.user = null;
            res.clearCookie("token");
            req.log.warn(`Token verification failed: ${err.message}`);
        } else {
            User.findByPk(decoded.id)
                .then(user => {
                     if (user) {
                         res.locals.user = user;
                         req.log.debug('User set in res.locals:', user.email);
                     } else {
                         res.locals.user = null;
                         res.clearCookie("token");
                         req.log.warn("User not found for token ID:", decoded.id);
                     }
                     next();
                })
                .catch(dbErr => {
                    res.locals.user = null;
                    req.log.error({ err: dbErr }, "Database error fetching user for token");
                    next();
                });
            return;
        }
         next();
    });
  } else {
    res.locals.user = null;
    req.log.debug('No token found, res.locals.user = null');
    next();
  }
};
