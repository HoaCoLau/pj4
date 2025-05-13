// controllers/admin/orderController.js
const { Order, OrderDetail, User, Product } = require('../../models');
const logger = require('../../config/logger');
const { Op } = require("sequelize"); // Để tìm kiếm (ví dụ)

exports.showOrdersPage = async (req, res, next) => {
  try {
    // Ví dụ phân trang cơ bản
    const page = parseInt(req.query.page) || 1;
    const limit = 15; // Số lượng order mỗi trang
    const offset = (page - 1) * limit;

    const { count, rows: orders } = await Order.findAndCountAll({
        include: [{
            model: User,
            as: 'customer',
            attributes: ['id', 'name', 'email'] // Chỉ lấy thông tin cần thiết của user
        }],
        order: [['orderDate', 'DESC']], // Sắp xếp mới nhất trước
        limit: limit,
        offset: offset
    });

    const totalPages = Math.ceil(count / limit);

    res.render('admin/orders/index', {
        pageTitle: 'Manage Orders',
        orders: orders,
        currentPage: page,
        totalPages: totalPages
    });
  } catch (error) {
    logger.error({ err: error }, 'Error fetching orders for admin view');
    next(error);
  }
};

exports.showOrderDetailPage = async (req, res, next) => {
    try {
        const orderId = req.params.id;
         if (isNaN(parseInt(orderId)) || parseInt(orderId) <= 0) { /* Validate ID */ }

        const order = await Order.findByPk(orderId, {
            include: [
                { model: User, as: 'customer', attributes: ['id', 'name', 'email'] },
                {
                    model: OrderDetail,
                    as: 'details', // Alias đã định nghĩa trong model/index.js
                    include: [{
                        model: Product,
                        as: 'product', // Alias đã định nghĩa
                        attributes: ['id', 'name', 'imageUrl'] // Lấy thông tin cần thiết của product
                    }]
                }
            ]
        });

        if (!order) { /* Xử lý not found */ }

        res.render('admin/orders/detail', {
            pageTitle: `Order Details #${order.id}`,
            order: order.get({ plain: true }) // Chuyển thành object thuần để dễ dùng trong EJS
        });
    } catch (error) {
        logger.error({ err: error, orderId: req.params.id }, 'Error fetching order detail for admin view');
        next(error);
    }
};

exports.handleUpdateStatus = async (req, res, next) => {
    const orderId = req.params.id;
     if (isNaN(parseInt(orderId)) || parseInt(orderId) <= 0) { /* Validate ID */ }

    // Kiểm tra lỗi Joi
    if (req.validationErrors) {
        logger.warn(`Order status update validation failed for ID ${orderId}:`, { errors: req.validationErrors });
        // Redirect về trang chi tiết với thông báo lỗi (qua query param)
        return res.redirect(`/admin/orders/${orderId}?error=invalid_status`);
    }

    const { status } = req.validatedBody || req.body;

    try {
        const order = await Order.findByPk(orderId);
        if (!order) { /* Xử lý not found */ }

        await order.update({ status });
        logger.info(`Order status updated by User ID ${req.user?.id}: Order ID ${orderId}, New Status: ${status}`);
        res.redirect(`/admin/orders/${orderId}?success=true`); // Redirect lại trang chi tiết
    } catch (error) {
         logger.error({ err: error, userId: req.user?.id, orderId, newStatus: status }, 'Error updating order status');
         next(error);
    }
};