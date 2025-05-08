isAuthenticated = (req, res, next) => {
    if (res.locals.user) {
      next();
    } else {
      req.log.warn(`Access denied: Not authenticated for ${req.method} ${req.originalUrl}`);
      res.redirect("/auth/signin?error=Vui lòng đăng nhập để truy cập trang này.");
    }
  };
  
  isAdminView = (req, res, next) => {
    if (res.locals.user && res.locals.user.role === "admin") {
      next();
    } else {
      req.log.warn(`Access denied: Not admin for ${req.method} ${req.originalUrl} (User: ${res.locals.user ? res.locals.user.email : 'N/A'})`);
      res.status(403).render("user/errorPage", { title: "Truy cập bị từ chối", message: "Bạn không có quyền truy cập trang Admin." });
    }
  };
  
  isUserView = (req, res, next) => {
       if (res.locals.user && res.locals.user.role === "user") {
          next();
       } else {
          req.log.warn(`Access denied: Not standard user for ${req.method} ${req.originalUrl} (User: ${res.locals.user ? res.locals.user.email : 'N/A'})`);
          res.status(403).render("user/errorPage", { title: "Truy cập bị từ chối", message: "Bạn không có quyền truy cập trang này." });
       }
  };
  
  const renderAuth = {
    isAuthenticated: isAuthenticated,
    isAdminView: isAdminView,
    isUserView: isUserView
  };
  module.exports = renderAuth;