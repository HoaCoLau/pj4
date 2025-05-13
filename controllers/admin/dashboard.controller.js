// controllers/admin/dashboard.controller.js
const { Product, User, Order, Category } = require('../../models');
const { sequelize } = require('../../models'); // Để dùng các hàm của Sequelize
const { Op } = require('sequelize');
const logger = require('../../config/logger.config');

exports.getDashboardStats = async (req, res) => {
    try {
        const totalProducts = await Product.count();
        const totalUsers = await User.count({ where: { role: 'user' } }); // Chỉ đếm user thường
        const totalOrders = await Order.count();
        const pendingOrders = await Order.count({ where: { status: 'pending' } });
        const totalCategories = await Category.count();

        // Doanh thu (ví dụ: tổng của các đơn hàng đã giao 'delivered')
        const totalRevenueResult = await Order.findAll({
            where: { status: 'delivered' },
            attributes: [[sequelize.fn('SUM', sequelize.col('total_amount')), 'totalRevenue']]
        });
        const totalRevenue = totalRevenueResult[0] ? totalRevenueResult[0].getDataValue('totalRevenue') || 0 : 0;


        // Đơn hàng mới trong 7 ngày qua
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentOrdersCount = await Order.count({
            where: {
                order_date: { // Hoặc createdAt nếu dùng nó làm ngày tạo
                    [Op.gte]: sevenDaysAgo
                }
            }
        });


        res.render('admin/dashboard', {
            layout: 'admin/layouts/main',
            title: 'Dashboard',
            stats: {
                totalProducts,
                totalUsers,
                totalOrders,
                pendingOrders,
                totalCategories,
                totalRevenue,
                recentOrdersCount
            }
        });
    } catch (error) {
        logger.error('Admin: Error fetching dashboard stats:', error);
        req.flash('error_msg', 'Không thể tải dữ liệu dashboard.');
        res.render('admin/dashboard', {
             layout: 'admin/layouts/main',
             title: 'Dashboard',
             stats: {} // Trả về rỗng nếu lỗi
        });
    }
};