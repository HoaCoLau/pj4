const db = require("../../models");
const Order = db.orders;
const OrderDetail = db.orderDetails;
const User = db.users;
const Product = db.products;
const { updateOrderStatusSchema } = require("../../validation/order.validation.js");
const logger = require('../../config/logger');

// Render trang danh sách đơn hàng (Admin)
exports.listOrders = async (req, res) => {
    req.log.info('Rendering admin order list');
    try {
        const data = await Order.findAll({
            include: [
                { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
                { model: OrderDetail, as: 'orderDetails', include: [{ model: Product, as: 'product', attributes: ['id', 'name'] }] }
            ],
            order: [['order_date', 'DESC']]
        });
        res.render("admin/orders/index", { title: "Quản lý Đơn hàng", orders: data });
    } catch (err) {
        req.log.error({ err }, "Lỗi khi lấy danh sách đơn hàng.");
        res.status(500).render("user/errorPage", { title: "Lỗi Database", message: err.message || "Lỗi khi lấy danh sách đơn hàng." });
    }
};

// Render trang chi tiết đơn hàng (Admin)
exports.orderDetail = async (req, res) => {
    const id = req.params.orderId;
    req.log.info(`Rendering admin order detail for ID: ${id}`);
    try {
        const data = await Order.findByPk(id, {
            include: [
                { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
                { model: OrderDetail, as: 'orderDetails', include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'price', 'image_url'] }] }
            ]
        });
        if (data) { res.render("admin/orders/detail", { title: `Chi tiết Đơn hàng #${data.id}`, order: data }); }
        else { req.log.warn(`Order not found for detail view: ${id}`); res.status(404).render("user/errorPage", { title: "Không tìm thấy", message: `Không tìm thấy Đơn hàng với id=${id}.` }); }
    } catch (err) {
        req.log.error({ err }, `Lỗi khi lấy chi tiết đơn hàng ${id}.`);
        res.status(500).render("user/errorPage", { title: "Lỗi Database", message: "Lỗi khi lấy chi tiết Đơn hàng: " + err.message });
    }
};

// Xử lý cập nhật trạng thái đơn hàng (POST với method-override PUT)
exports.updateOrderStatusProcess = async (req, res) => {
    const id = req.params.orderId;
    const { error, value } = updateOrderStatusSchema.validate(req.body);
    if (error) {
       logger.warn(`Validation failed for order status update (${id}): ${error.details[0].message}`);
       return res.redirect(`/admin/orders/${id}?error=${error.details[0].message}`);
    }
    try {
      const num = await Order.update({ status: value.status }, { where: { id: id } });
        if (num[0] === 1) {
            logger.info(`Order status updated for ID ${id} to ${value.status}`);
            res.redirect(`/admin/orders/${id}?success=Cập nhật trạng thái đơn hàng thành công!`);
        } else {
            logger.warn(`Order not found or no changes for status update: ${id}`);
            res.redirect(`/admin/orders/${id}?error=Không tìm thấy hoặc không có gì để cập nhật đơn hàng.`);
        }
    } catch (err) {
        logger.error({ err }, `Lỗi khi cập nhật trạng thái đơn hàng ${id}.`);
        res.redirect(`/admin/orders/${id}?error=${err.message || "Đã xảy ra lỗi khi cập nhật trạng thái đơn hàng."}`);
    }
};

// Xử lý xóa đơn hàng (Admin) (POST với method-override DELETE)
exports.deleteOrderProcess = async (req, res) => {
    const id = req.params.orderId;
    req.log.info(`Attempting to delete order ID: ${id}`);
    try {
      const num = await Order.destroy({ where: { id: id } });
        if (num === 1) {
            logger.info(`Order deleted: ${id}`);
            res.redirect("/admin/orders?success=Xóa đơn hàng thành công!");
        } else {
             logger.warn(`Order not found for deletion: ${id}`);
             res.redirect("/admin/orders?error=Không tìm thấy đơn hàng để xóa.");
        }
    } catch (err) {
         logger.error({ err }, `Lỗi khi xóa đơn hàng ${id}.`);
         res.redirect(`/admin/orders?error=${err.message || "Đã xảy ra lỗi khi xóa đơn hàng."}`);
    }
};
