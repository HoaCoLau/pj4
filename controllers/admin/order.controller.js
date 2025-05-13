// controllers/admin/order.controller.js
const { Order, OrderDetail, User, Product } = require('../../models');
const logger = require('../../config/logger.config');
const { Op } = require('sequelize');

// GET: Display list of orders
exports.getAllOrders = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 15;
        const offset = (page - 1) * limit;
        const { status, search } = req.query;

        let whereClause = {};
        if (status) {
            whereClause.status = status;
        }
        if (search) { // Tìm theo ID đơn hàng hoặc email người dùng
            whereClause[Op.or] = [
                { id: search }, // Giả sử search là số nếu là ID
                { '$User.email$': { [Op.like]: `%${search}%` } } // Tìm theo email user
            ];
        }


        const { count, rows: orders } = await Order.findAndCountAll({
            where: whereClause,
            include: [{ model: User, attributes: ['id', 'name', 'email'] }],
            order: [['order_date', 'DESC']], // Hoặc createdAt
            limit: limit,
            offset: offset,
            distinct: true
        });

        res.render('admin/orders/index', {
            layout: 'admin/layouts/main',
            title: 'Quản lý Đơn hàng',
            orders: orders.map(o => o.toJSON()),
            currentPage: page,
            totalPages: Math.ceil(count / limit),
            currentStatus: status,
            currentSearch: search,
            orderStatuses: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'] // Để filter
        });
    } catch (error) {
        logger.error('Admin: Error fetching orders:', error);
        req.flash('error_msg', 'Không thể tải danh sách đơn hàng.');
        res.redirect('/admin/dashboard');
    }
};

// GET: Show order details
exports.getOrderDetails = async (req, res) => {
    try {
        const orderId = req.params.id;
        const order = await Order.findByPk(orderId, {
            include: [
                { model: User, attributes: ['id', 'name', 'email'] },
                {
                    model: OrderDetail,
                    as: 'details', // Alias đã định nghĩa trong models/index.js
                    include: [{ model: Product, attributes: ['id', 'name', 'image_url'] }]
                }
            ]
        });

        if (!order) {
            req.flash('error_msg', 'Đơn hàng không tồn tại.');
            return res.redirect('/admin/orders');
        }

        res.render('admin/orders/detail', {
            layout: 'admin/layouts/main',
            title: `Chi tiết Đơn hàng #${order.id}`,
            order: order.toJSON(),
            orderStatuses: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']
        });
    } catch (error) {
        logger.error(`Admin: Error fetching order details for ID ${req.params.id}:`, error);
        req.flash('error_msg', 'Lỗi tải chi tiết đơn hàng.');
        res.redirect('/admin/orders');
    }
};

// POST: Update order status
exports.updateOrderStatus = async (req, res) => {
    const orderId = req.params.id;
    const { status } = req.body;
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];

    if (!validStatuses.includes(status)) {
        req.flash('error_msg', 'Trạng thái đơn hàng không hợp lệ.');
        return res.redirect(`/admin/orders/detail/${orderId}`);
    }

    try {
        const order = await Order.findByPk(orderId);
        if (!order) {
            req.flash('error_msg', 'Đơn hàng không tồn tại.');
            return res.redirect('/admin/orders');
        }

        // Thêm logic nghiệp vụ ở đây nếu cần (ví dụ: không cho chuyển từ 'delivered' về 'pending')
        // Hoặc kiểm tra stock khi chuyển sang 'processing' (nếu chưa làm khi tạo order)

        await order.update({ status: status });
        req.flash('success_msg', `Trạng thái đơn hàng #${orderId} đã được cập nhật thành "${status}".`);
        res.redirect(`/admin/orders/detail/${orderId}`);
    } catch (error) {
        logger.error(`Admin: Error updating order status for ID ${orderId}:`, error);
        req.flash('error_msg', 'Lỗi khi cập nhật trạng thái đơn hàng.');
        res.redirect(`/admin/orders/detail/${orderId}`);
    }
};