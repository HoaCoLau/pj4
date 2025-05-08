const db = require("../../models");
const Order = db.orders;
const OrderDetail = db.orderDetails;
const User = db.users;
const Product = db.products;
const Op = db.Op;
const { updateOrderStatusSchema } = require("../../validation/order.validation.js"); // Import schema
const logger = require('../../config/logger');

// Render trang danh sách đơn hàng (Admin)
exports.listOrders = (req, res) => {
    req.log.info('Rendering admin order list');
    // Lấy tất cả đơn hàng, có thể include User và OrderDetails
    Order.findAll({
        include: [
            { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
            { model: OrderDetail, as: 'orderDetails', include: [{ model: Product, as: 'product', attributes: ['id', 'name'] }] }
        ],
        order: [['order_date', 'DESC']] // Sắp xếp theo ngày mới nhất
    })
    .then(data => {
        res.render("admin/orders/index", {
            title: "Quản lý Đơn hàng",
            orders: data,
        });
    })
    .catch(err => {
        req.log.error({ err }, "Lỗi khi lấy danh sách đơn hàng.");
        res.status(500).render("user/errorPage", { title: "Lỗi Database", message: err.message || "Lỗi khi lấy danh sách đơn hàng." });
    });
};

// Render trang chi tiết đơn hàng (Admin)
exports.orderDetail = (req, res) => {
    const id = req.params.orderId;
    req.log.info(`Rendering admin order detail for ID: ${id}`);
    Order.findByPk(id, {
        include: [
            { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
            { model: OrderDetail, as: 'orderDetails', include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'price', 'image_url'] }] }
        ]
    })
    .then(data => {
        if (data) {
            res.render("admin/orders/detail", {
                title: `Chi tiết Đơn hàng #${data.id}`,
                order: data,
            });
        } else {
            req.log.warn(`Order not found for detail view: ${id}`);
            res.status(404).render("user/errorPage", { title: "Không tìm thấy", message: `Không tìm thấy Đơn hàng với id=${id}.` });
        }
    })
    .catch(err => {
        req.log.error({ err }, `Lỗi khi lấy chi tiết đơn hàng ${id}.`);
        res.status(500).render("user/errorPage", { title: "Lỗi Database", message: "Lỗi khi lấy chi tiết Đơn hàng: " + err.message });
    });
};

// Xử lý cập nhật trạng thái đơn hàng (POST với method-override PUT)
exports.updateOrderStatusProcess = (req, res) => {
    const id = req.params.orderId;
    // ** Validation sử dụng Joi cho trạng thái mới **
    const { error, value } = updateOrderStatusSchema.validate(req.body, { abortEarly: false });

    if (error) {
       req.log.warn(`Validation failed for order status update (${id}): ${error.details.map(x => x.message).join(', ')}`);
       return res.redirect(`/admin/orders/${id}?error=${error.details[0].message}`);
    }

    // Dữ liệu hợp lệ, cập nhật trạng thái
    Order.update({ status: value.status }, { where: { id: id } })
        .then(num => {
            if (num[0] === 1) {
                req.log.info(`Order status updated for ID ${id} to ${value.status}`);
                res.redirect(`/admin/orders/${id}?success=Cập nhật trạng thái đơn hàng thành công!`);
            } else {
                req.log.warn(`Order not found or no changes for status update: ${id}`);
                res.redirect(`/admin/orders/${id}?error=Không tìm thấy hoặc không có gì để cập nhật đơn hàng.`);
            }
        })
        .catch(err => {
            req.log.error({ err }, `Lỗi khi cập nhật trạng thái đơn hàng ${id}.`);
            res.redirect(`/admin/orders/${id}?error=${err.message || "Lỗi khi cập nhật trạng thái đơn hàng."}`);
        });
};

// Xử lý xóa đơn hàng (Admin) (POST với method-override DELETE)
exports.deleteOrderProcess = (req, res) => {
    const id = req.params.orderId;
    req.log.info(`Attempting to delete order ID: ${id}`);
    // Do ràng buộc khóa ngoại ON DELETE CASCADE, order_details liên quan sẽ tự xóa
    Order.destroy({ where: { id: id } })
        .then(num => {
            if (num === 1) {
                req.log.info(`Order deleted: ${id}`);
                res.redirect("/admin/orders?success=Xóa đơn hàng thành công!");
            } else {
                req.log.warn(`Order not found for deletion: ${id}`);
                res.redirect("/admin/orders?error=Không tìm thấy đơn hàng để xóa.");
            }
        })
        .catch(err => {
            req.log.error({ err }, `Lỗi khi xóa đơn hàng ${id}.`);
             // Xử lý lỗi khác nếu có
            res.redirect(`/admin/orders?error=${err.message || "Lỗi khi xóa đơn hàng."}`);
        });
};