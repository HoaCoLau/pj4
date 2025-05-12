const db = require("../../models");
const Order = db.orders;
const OrderDetail = db.orderDetails;
const Cart = db.carts;
const CartDetail = db.cartDetails;
const Product = db.products;
const { createOrderSchema } = require("../../validation/order.validation.js");
const logger = require('../../config/logger');

// Xử lý tạo đơn hàng từ giỏ hàng (POST)
exports.createOrderProcess = async (req, res) => {
    const userId = res.locals.user.id;
    req.log.info(`Attempting to create order for user ${userId}`);
    const { error, value } = createOrderSchema.validate(req.body, { abortEarly: false });

    if (error) {
        req.log.warn(`Validation failed for order creation (user ${userId}): ${error.details.map(x => x.message).join(', ')}`);
        return res.redirect("/user/cart?error=Thông tin đơn hàng không hợp lệ: " + error.details[0].message);
    }

    try { // Bắt đầu try block
        const result = await db.sequelize.transaction(async (t) => { // Sử dụng await cho transaction
            const cart = await Cart.findOne({ // Sử dụng await
                where: { user_id: userId },
                include: [{
                    model: CartDetail,
                    as: 'cartDetails',
                    include: [{ model: Product, as: 'product' }]
                }]
            }, { transaction: t });

            if (!cart || !cart.cartDetails || cart.cartDetails.length === 0) {
                 throw new Error("Giỏ hàng rỗng, không thể tạo đơn hàng.");
            }

            const orderDetailsData = cart.cartDetails.map(item => ({
                product_id: item.product_id,
                quantity: item.quantity,
                price_at_order: item.price_at_addition,
                product_name: item.product.name
            }));

             const totalAmount = orderDetailsData.reduce((sum, item) => sum + (item.quantity * item.price_at_order), 0);

            const order = await Order.create({ // Sử dụng await
                user_id: userId,
                total_amount: totalAmount,
                status: 'pending',
                shipping_address: value.shipping_address,
                billing_address: value.billing_address,
                payment_method: value.payment_method,
                notes: value.notes
            }, { transaction: t });

             const orderDetailsForCreation = orderDetailsData.map(item => ({
                 ...item,
                 order_id: order.id
             }));
            await OrderDetail.bulkCreate(orderDetailsForCreation, { transaction: t }); // Sử dụng await

            await CartDetail.destroy({ where: { cart_id: cart.id } }, { transaction: t }); // Sử dụng await

            req.log.info(`Order created successfully for user ${userId} with ID ${order.id}`);
            return order;
        });

        res.redirect(`/user/orders/${result.id}?success=Tạo đơn hàng thành công!`);

    } catch (err) { // Bắt đầu catch block
        req.log.error({ err }, `Lỗi khi tạo đơn hàng cho user ${userId}.`);
        res.redirect(`/user/cart?error=${err.message || "Đã xảy ra lỗi khi tạo đơn hàng."}`);
    }
};


// Render trang danh sách đơn hàng của user
exports.listOrders = async (req, res) => { // Sử dụng async
    const userId = res.locals.user.id;
    req.log.info(`Rendering user order list for user ${userId}`);
    try { // Bắt đầu try block
        const data = await Order.findAll({ // Sử dụng await
            where: { user_id: userId },
            include: [{ model: OrderDetail, as: 'orderDetails', include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'image_url'] }] }],
            order: [['order_date', 'DESC']]
        });
        res.render("user/orders/index", {
            title: "Đơn hàng của bạn",
            orders: data,
        });
    } catch (err) { // Bắt đầu catch block
        req.log.error({ err }, `Lỗi khi lấy danh sách đơn hàng cho user ${userId}.`);
        res.status(500).render("user/errorPage", { title: "Lỗi Database", message: err.message || "Lỗi khi lấy danh sách đơn hàng." });
    }
};

// Render trang chi tiết đơn hàng của user
exports.orderDetail = async (req, res) => { // Sử dụng async
    const userId = res.locals.user.id;
    const orderId = req.params.orderId;
    req.log.info(`Rendering user order detail for ID ${orderId} (user ${userId})`);
    try { // Bắt đầu try block
        const data = await Order.findOne({ // Sử dụng await
            where: { id: orderId, user_id: userId },
            include: [
                 { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
                 { model: OrderDetail, as: 'orderDetails', include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'price', 'image_url'] }] }
            ]
        });
        if (data) {
            res.render("user/orders/detail", {
                title: `Chi tiết Đơn hàng #${data.id}`,
                order: data,
            });
        } else {
             req.log.warn(`Order not found for user ${userId}: ${orderId}`);
             res.status(404).render("user/errorPage", { title: "Không tìm thấy", message: `Không tìm thấy Đơn hàng với id=${orderId}.` });
        }
    } catch (err) { // Bắt đầu catch block
         req.log.error({ err }, `Lỗi khi lấy chi tiết đơn hàng ${orderId} cho user ${userId}.`);
        res.status(500).render("user/errorPage", { title: "Lỗi Database", message: "Lỗi khi lấy chi tiết Đơn hàng: " + err.message });
    }
};
