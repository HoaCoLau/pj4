// middleware/setUserLocals.js
const jwt = require('jsonwebtoken');
const db = require('../models');
const User = db.users;
module.exports = (req, res, next) => {
  const token = req.cookies.token; 

  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
           
            res.locals.user = null;
            res.clearCookie("token");
            console.error("Token verification failed:", err.message);
        } else {
            
            User.findByPk(decoded.id)
                .then(user => {
                     if (user) {
                         res.locals.user = user; 
                         console.log('User set in res.locals:', user.email);
                     } else {
                         res.locals.user = null; 
                         res.clearCookie("token");
                         console.warn("User not found for token ID:", decoded.id);
                     }
                     next(); 
                })
                .catch(dbErr => {
                    res.locals.user = null; 
                    console.error("Database error fetching user for token:", dbErr);
                    next(); 
                });
            return; 
        }
         next(); 
    });
  } else {

    res.locals.user = null;
    console.log('No token found, res.locals.user = null');
    next();
  }
};