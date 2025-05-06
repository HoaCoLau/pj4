const jwt = require('jsonwebtoken');

exports.authenticateToken = (req, res, next) => {
  const token = req.cookies.token; 

  if (!token) {
    return res.redirect('/login'); 
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified; 
    next();
  } catch (err) {
    console.error(err);
    res.redirect('/login');
  }
};
