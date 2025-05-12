const logger = require('../../config/logger');
const db = require('../../models');
const Product = db.products;
const Order = db.orders;
const User = db.users;

exports.showDashboard = async (req, res) => { 
    req.log.info('Rendering admin dashboard');
    try {
        const productCount = await Product.count();
        const orderCount = await Order.count();
        const userCount = await User.count();

        res.render("admin/dashboard", {
            title: "Dashboard Admin",
            productCount: productCount,
            orderCount: orderCount,
            userCount: userCount
        });
    } catch (err) {
        req.log.error({ err }, "Lỗi khi lấy dữ liệu dashboard.");
        res.status(500).render("user/errorPage", { title: "Lỗi Server", message: "Không thể tải dashboard." });
    }
};
