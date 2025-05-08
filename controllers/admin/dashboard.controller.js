const logger = require('../../config/logger');
const db = require('../../models');


exports.showDashboard = (req, res) => {
    req.log.info('Rendering admin dashboard');

     res.render("admin/dashboard", {
         title: "Dashboard Admin"
     });
};