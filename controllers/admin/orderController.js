// controllers/admin/orderController.js
const db = require('../../models');
const Order = db.order;
const User = db.user;
const OrderDetail = db.orderDetail;
const Product = db.product; // Để include thông tin sản phẩm trong order detail
const Joi = require('joi');
// const logger = require('../../config/logger');

// Schema validation cho cập nhật trạng thái đơn hàng
const orderStatusSchema = Joi.object({
    status: Joi.string().valid('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded').required().messages({'any.only': 'Trạng thái đơn hàng không hợp lệ.'}),
});

// Hiển thị danh sách đơn hàng (Admin)
exports.index = async (req, res) => {
    try {
        const orders = await Order.findAll({
             include: User, // Lấy thông tin user đặt hàng (user_id có thể NULL)
             order: [['order_date', 'DESC']] // Sắp xếp theo ngày đặt hàng mới nhất
        });
        res.render('admin/orders/index', {
            title: 'Quản lý Đơn hàng',
            orders,
            success: req.query.success,
            error: req.query.error
        });
    } catch (err) {
        console.error('Lỗi lấy danh sách đơn hàng:', err);
        // logger.error(`Admin Order Index Error: ${err.message}`);
        res.status(500).send('Lỗi máy chủ khi lấy danh sách đơn hàng.');
    }
};

// Hiển thị chi tiết đơn hàng (Admin)
exports.detail = async (req, res) => {
    try {
        const order = await Order.findByPk(req.params.id, {
             include: [
                { model: User, attributes: ['id', 'name', 'email'] }, // Lấy thông tin user
                {
                    model: OrderDetail,
                    include: Product // Lấy thông tin product liên quan đến order detail
                }
             ]
        });

        if (!order) {
             // logger.warn(`Admin Order Detail: Order ${req.params.id} not found.`);
            return res.status(404).send('Đơn hàng không tồn tại.');
        }

        res.render('admin/orders/detail', {
            title: 'Chi tiết Đơn hàng',
            order,
            success: req.query.success,
            error: req.query.error
        });
    } catch (err) {
        console.error('Lỗi lấy chi tiết đơn hàng:', err);
        // logger.error(`Admin Order Detail Error: ${err.message}`);
        res.status(500).send('Lỗi máy chủ khi lấy chi tiết đơn hàng.');
    }
};

// Xử lý cập nhật trạng thái đơn hàng (Admin)
exports.updateStatus = async (req, res) => {
     const { error, value } = orderStatusSchema.validate(req.body);
     const orderId = req.params.id;

     if (error) {
          // Không redirect với lỗi validation body, hiển thị lại trang detail với lỗi
          const order = await Order.findByPk(orderId, {
              include: [
                 { model: User, attributes: ['id', 'name', 'email'] },
                 { model: OrderDetail, include: Product }
              ]
          });
          if (!order) { return res.status(404).send('Đơn hàng không tồn tại.'); }
          return res.render('admin/orders/detail', {
              title: 'Chi tiết Đơn hàng',
              order,
              error: [error.details[0].message]
          });
     }

    try {
        const order = await Order.findByPk(orderId);
        if (!order) {
             // logger.warn(`Admin Order Update Status: Order ${orderId} not found.`);
            return res.redirect('/admin/orders?error=' + encodeURIComponent('Đơn hàng không tồn tại.'));
        }

        await order.update({ status: value.status });

        // logger.info(`Admin updated order status: ${orderId} to ${value.status}`);

        res.redirect('/admin/orders/detail/' + orderId + '?success=' + encodeURIComponent('Cập nhật trạng thái đơn hàng thành công!'));

    } catch (err) {
        console.error('Lỗi khi cập nhật trạng thái đơn hàng:', err);
        // logger.error(`Admin Order Update Status Error: ${err.message}`);
        // Redirect về trang detail với lỗi
        res.redirect('/admin/orders/detail/' + orderId + '?error=' + encodeURIComponent('Có lỗi xảy ra khi cập nhật trạng thái đơn hàng.'));
    }
};

// Xử lý xóa đơn hàng (Admin) - CÂN NHẮC TRƯỚC KHI SỬ DỤNG
exports.delete = async (req, res) => {
     try {
         const order = await Order.findByPk(req.params.id);
         if (!order) {
              // logger.warn(`Admin Order Delete: Order ${req.params.id} not found.`);
              return res.redirect('/admin/orders?error=' + encodeURIComponent('Đơn hàng không tồn tại.'));
         }

         await order.destroy(); // Sequelize sẽ xử lý cascade delete cho order_details

         // logger.info(`Admin deleted order: ${req.params.id}`);

         res.redirect('/admin/orders?success=' + encodeURIComponent('Xóa đơn hàng thành công!'));

     } catch (err) {
         console.error('Lỗi khi xóa đơn hàng:', err);
         // logger.error(`Admin Order Delete Error: ${err.message}`);
         res.redirect('/admin/orders?error=' + encodeURIComponent('Có lỗi xảy ra khi xóa đơn hàng.'));
     }
 };