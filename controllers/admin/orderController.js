// controllers/public/orderController.js
const { Order, OrderDetail, Product } = require('../../models');
const logger = require('../../config/logger');
const { Op } = require("sequelize");

exports.showUserOrders = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const offset = (page - 1) * limit;

        const { count, rows: orders } = await Order.findAndCountAll({
            where: { userId: userId },
            order: [['orderDate', 'DESC']],
            limit: limit,
            offset: offset,
            attributes: ['id', 'orderDate', 'totalAmount', 'status', 'updatedAt']
        });

        const totalPages = Math.ceil(count / limit);

        res.render('public/orders/index', {
            pageTitle: 'Lịch Sử Đơn Hàng',
            orders: orders.map(o => o.get({ plain: true })),
            currentPage: page,
            totalPages: totalPages,
            path: '/orders'
        });
    } catch (error) {
         logger.error({ err: error, userId: req.user?.id }, 'Error fetching user orders list');
         next(error);
    }
};

exports.showUserOrderDetail = async (req, res, next) => {
    try {
        const orderId = req.params.id;
        const userId = req.user.id;

        if (isNaN(parseInt(orderId)) || parseInt(orderId) <= 0) {
            const error = new Error('Invalid Order ID format.');
            error.statusCode = 400;
            return next(error);
        }

        const order = await Order.findOne({
            where: {
                id: orderId,
                userId: userId
            },
            include: [
                {
                    model: OrderDetail,
                    as: 'details',
                    include: [{
                        model: Product,
                        as: 'product',
                        attributes: ['id', 'name', 'imageUrl']
                    }]
                }
            ]
        });

        if (!order) {
            logger.warn(`User ID ${userId} tried to access non-existent or unauthorized order ID ${orderId}.`);
            const error = new Error('Đơn hàng không tồn tại hoặc bạn không có quyền xem.');
            error.statusCode = 404;
            return next(error);
        }

        res.render('public/orders/detail', {
            pageTitle: `Chi Tiết Đơn Hàng #${order.id}`,
            order: order.get({ plain: true }),
            path: `/orders/${order.id}`
        });
    } catch (error) {
        logger.error({ err: error, userId: req.user?.id, orderId: req.params.id }, 'Error fetching user order detail');
        next(error);
    }
};