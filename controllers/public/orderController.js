// controllers/public/orderController.js
const { Order, OrderDetail, Product, User } = require('../../models'); // User có thể không cần nếu không hiển thị lại thông tin user ở đây
const logger = require('../../config/logger');
const { Op } = require("sequelize");

// GET: Hiển thị lịch sử đơn hàng của người dùng hiện tại
exports.showUserOrders = async (req, res, next) => {
    try {
        const userId = req.user.id; // Lấy userId từ user đã đăng nhập (gắn bởi authenticateToken)
        const page = parseInt(req.query.page) || 1;
        const limit = 10; // Số đơn hàng mỗi trang
        const offset = (page - 1) * limit;

        const { count, rows: orders } = await Order.findAndCountAll({
            where: { userId: userId }, // CHỈ lấy đơn hàng của user này
            order: [['orderDate', 'DESC']], // Sắp xếp theo ngày đặt mới nhất
            limit: limit,
            offset: offset,
            attributes: ['id', 'orderDate', 'totalAmount', 'status', 'updatedAt'] // Chỉ lấy các trường cần thiết cho danh sách
        });

        const totalPages = Math.ceil(count / limit);

        res.render('public/orders/index', { // Render file views/public/orders/index.ejs
            pageTitle: 'Lịch Sử Đơn Hàng Của Tôi',
            orders: orders,
            currentPage: page,
            totalPages: totalPages,
            path: '/orders' // Cho active menu
        });
    } catch (error) {
         logger.error({ err: error, userId: req.user?.id }, 'Error fetching user orders list');
         next(error);
    }
};

// GET: Hiển thị chi tiết một đơn hàng của người dùng hiện tại
exports.showUserOrderDetail = async (req, res, next) => {
    try {
        const orderId = req.params.id;
        const userId = req.user.id; // Lấy userId từ user đã đăng nhập

        // Validate orderId là số nguyên dương
        if (isNaN(parseInt(orderId)) || parseInt(orderId) <= 0) {
            const error = new Error('Invalid Order ID format.');
            error.statusCode = 400; // Bad Request
            return next(error);
        }

        const order = await Order.findOne({
            where: {
                id: orderId,
                userId: userId // Đảm bảo user chỉ xem được đơn hàng của chính mình
            },
            include: [
                // Không cần include User ở đây vì chúng ta đã filter theo userId
                // { model: User, as: 'customer', attributes: ['id', 'name', 'email'] },
                {
                    model: OrderDetail,
                    as: 'details', // Alias đã định nghĩa trong models/index.js
                    include: [{
                        model: Product,
                        as: 'product', // Alias đã định nghĩa
                        attributes: ['id', 'name', 'imageUrl'] // Lấy các trường cần thiết của product
                    }]
                }
            ]
        });

        if (!order) {
            logger.warn(`User ID ${userId} attempted to access non-existent or unauthorized order ID ${orderId}.`);
            const error = new Error('Order not found or you do not have permission to view this order.');
            error.statusCode = 404; // Not Found (hoặc 403 Forbidden nếu muốn rõ ràng hơn về quyền)
            return next(error);
        }

        res.render('public/orders/detail', { // Render file views/public/orders/detail.ejs
            pageTitle: `Chi Tiết Đơn Hàng #${order.id}`,
            order: order.get({ plain: true }), // Chuyển thành object thuần để dễ dùng trong EJS
            path: '/orders' // Cho active menu
        });
    } catch (error) {
        logger.error({ err: error, userId: req.user?.id, orderId: req.params.id }, 'Error fetching user order detail');
        next(error);
    }
};

// POST: Xử lý yêu cầu hủy đơn hàng (nếu trạng thái cho phép) - Tùy chọn, nâng cao
// exports.handleCancelOrder = async (req, res, next) => {
//     const orderId = req.params.id;
//     const userId = req.user.id;
//     try {
//         const order = await Order.findOne({ where: { id: orderId, userId: userId } });
//         if (!order) {
//             // Xử lý lỗi không tìm thấy đơn hàng hoặc không phải của user
//             return res.redirect('/orders?error=notfound_or_unauthorized');
//         }

//         // Chỉ cho phép hủy nếu đơn hàng đang ở trạng thái 'pending' (ví dụ)
//         if (order.status !== 'pending') {
//             logger.warn(`User ID ${userId} attempt to cancel non-pending order ID ${orderId} (Status: ${order.status})`);
//             return res.redirect(`/orders/${orderId}?error=cannot_cancel`);
//         }

//         order.status = 'cancelled';
//         await order.save();
//         logger.info(`User ID ${userId} cancelled order ID ${orderId}`);
//         res.redirect(`/orders/${orderId}?success=cancelled`);

//     } catch (error) {
//         logger.error({ err: error, userId, orderId }, 'Error cancelling user order');
//         next(error);
//     }
// };