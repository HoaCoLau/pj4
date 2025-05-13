// controllers/user/order.controller.js
const { Order, OrderDetail, Cart, CartDetail, Product, User, sequelize } = require('../../models');
const logger = require('../../config/logger.config');
const Joi = require('joi');

const checkoutSchema = Joi.object({
    // name: Joi.string().required().messages({'any.required': 'Họ tên người nhận là bắt buộc'}),
    shipping_address: Joi.string().required().messages({'any.required': 'Địa chỉ giao hàng là bắt buộc'}),
    // phone: Joi.string().pattern(/^[0-9]{10,11}$/).required().messages({'any.required': 'Số điện thoại là bắt buộc', 'string.pattern.base': 'Số điện thoại không hợp lệ'}),
    payment_method: Joi.string().valid('cod', 'bank_transfer').required().messages({'any.required': 'Vui lòng chọn phương thức thanh toán'}),
    notes: Joi.string().allow('', null)
});


// GET: Hiển thị trang thanh toán
exports.showCheckoutPage = async (req, res) => {
    try {
        const userId = req.user.id;
        const cart = await Cart.findOne({
            where: { user_id: userId },
            include: [{
                model: CartDetail,
                as: 'items',
                required: true, // Chỉ checkout nếu có items
                include: [{ model: Product, attributes: ['id', 'name', 'price', 'stock_quantity'] }]
            }]
        });

        if (!cart || !cart.items || cart.items.length === 0) {
            req.flash('error_msg', 'Giỏ hàng của bạn trống. Vui lòng thêm sản phẩm để thanh toán.');
            return res.redirect('/cart');
        }

        let cartTotal = 0;
        let hasUnavailableProduct = false;
        for (const item of cart.items) {
            if (!item.Product || item.quantity > item.Product.stock_quantity) {
                hasUnavailableProduct = true;
                item.isUnavailable = true; // Đánh dấu item không khả dụng
                req.flash('error_msg', `Sản phẩm "${item.Product ? item.Product.name : 'Một sản phẩm'}" không đủ số lượng tồn kho hoặc không còn tồn tại. Vui lòng cập nhật giỏ hàng.`);
            }
            if(item.Product) {
                 item.subtotal = item.quantity * item.Product.price;
                 cartTotal += item.subtotal;
            } else {
                item.subtotal = 0; // Sản phẩm đã bị xóa
            }
        }
         if (hasUnavailableProduct) {
            // Không redirect ngay, để người dùng thấy thông báo trên trang checkout và có thể quay lại giỏ hàng
            // return res.redirect('/cart');
        }


        // Lấy thông tin user để điền sẵn (nếu có)
        const user = await User.findByPk(userId, { attributes: ['name', 'email'] });


        res.render('user/checkout', {
            layout: 'user/layouts/main',
            title: 'Thanh toán Đơn hàng',
            cartItems: cart.items.map(item => item.toJSON()),
            cartTotal: cartTotal,
            hasUnavailableProduct: hasUnavailableProduct,
            checkoutData: { name: user ? user.name : '' }, // Điền sẵn tên
            errors: null
        });
    } catch (error) {
        logger.error(`User: Error showing checkout page for user ID ${req.user.id}:`, error);
        req.flash('error_msg', 'Lỗi khi tải trang thanh toán.');
        res.redirect('/cart');
    }
};

// POST: Tạo đơn hàng
exports.createOrder = async (req, res) => {
    const userId = req.user.id;
    const { error, value } = checkoutSchema.validate(req.body, { abortEarly: false });

    // Lấy lại thông tin giỏ hàng để render lỗi nếu có
    let cartForErrorHandling;
    try {
        cartForErrorHandling = await Cart.findOne({
            where: { user_id: userId },
            include: [{ model: CartDetail, as: 'items', include: [Product] }]
        });
    } catch (fetchCartError){
        logger.error('Error fetching cart during order creation error:', fetchCartError);
        req.flash('error_msg', 'Lỗi hệ thống, không thể tạo đơn hàng.');
        return res.redirect('/cart');
    }

    const cartItemsForError = cartForErrorHandling && cartForErrorHandling.items ? cartForErrorHandling.items.map(i => i.toJSON()) : [];
    const cartTotalForError = cartItemsForError.reduce((sum, item) => sum + (item.Product ? item.quantity * item.Product.price : 0), 0);


    if (error) {
        const validationErrors = error.details.reduce((acc, current) => {
            acc[current.path[0]] = current.message; return acc;
        }, {});
        return res.status(400).render('user/checkout', {
            layout: 'user/layouts/main',
            title: 'Thanh toán Đơn hàng',
            cartItems: cartItemsForError,
            cartTotal: cartTotalForError,
            checkoutData: value, // Giữ lại dữ liệu đã nhập
            errors: validationErrors,
            hasUnavailableProduct: cartItemsForError.some(item => !item.Product || item.quantity > item.Product.stock_quantity)
        });
    }


    const transaction = await sequelize.transaction(); // Bắt đầu transaction

    try {
        const cart = await Cart.findOne({
            where: { user_id: userId },
            include: [{
                model: CartDetail,
                as: 'items',
                required: true,
                include: [{ model: Product }] // Cần Product để lấy giá và tên, và kiểm tra stock
            }],
            transaction // Chạy query này trong transaction
        });

        if (!cart || !cart.items || cart.items.length === 0) {
            await transaction.rollback();
            req.flash('error_msg', 'Giỏ hàng trống hoặc đã có lỗi xảy ra.');
            return res.redirect('/cart');
        }

        let orderTotalAmount = 0;
        const orderDetailsData = [];

        // Kiểm tra lại số lượng tồn kho và tính tổng tiền
        for (const item of cart.items) {
            if (!item.Product) {
                await transaction.rollback();
                req.flash('error_msg', `Sản phẩm với ID ${item.product_id} không còn tồn tại.`);
                return res.redirect('/cart');
            }
            if (item.quantity > item.Product.stock_quantity) {
                await transaction.rollback();
                req.flash('error_msg', `Không đủ số lượng cho sản phẩm "${item.Product.name}". Chỉ còn ${item.Product.stock_quantity} trong kho.`);
                return res.redirect('/cart');
            }
            orderTotalAmount += item.quantity * item.Product.price;
            orderDetailsData.push({
                product_id: item.product_id,
                quantity: item.quantity,
                price_at_order: item.Product.price, // Lưu giá tại thời điểm đặt hàng
                product_name: item.Product.name    // Lưu tên sản phẩm
            });
        }

        // Tạo đơn hàng
        const newOrder = await Order.create({
            user_id: userId,
            total_amount: orderTotalAmount,
            status: 'pending', // Trạng thái ban đầu
            shipping_address: value.shipping_address,
            billing_address: value.shipping_address, // Giả sử giống nhau, hoặc thêm field riêng
            payment_method: value.payment_method,
            notes: value.notes
        }, { transaction });

        // Thêm chi tiết đơn hàng và cập nhật số lượng sản phẩm
        for (const detail of orderDetailsData) {
            await OrderDetail.create({
                order_id: newOrder.id,
                ...detail
            }, { transaction });

            // Giảm số lượng tồn kho
            await Product.update(
                { stock_quantity: sequelize.literal(`stock_quantity - ${detail.quantity}`) },
                { where: { id: detail.product_id }, transaction }
            );
        }

        // Xóa các mục trong giỏ hàng của user (hoặc xóa cả cart nếu muốn)
        await CartDetail.destroy({ where: { cart_id: cart.id }, transaction });
        // Hoặc await cart.destroy({ transaction }); // Nếu muốn xóa luôn cả cart

        await transaction.commit(); // Commit transaction nếu mọi thứ thành công

        logger.info(`User ID ${userId} created order ID ${newOrder.id}`);
        req.flash('success_msg', `Đặt hàng thành công! Mã đơn hàng của bạn là #${newOrder.id}.`);
        res.redirect(`/orders/${newOrder.id}`); // Chuyển đến trang chi tiết đơn hàng vừa tạo

    } catch (err) {
        await transaction.rollback(); // Rollback nếu có lỗi
        logger.error(`User: Error creating order for user ID ${userId}:`, err);
        req.flash('error_msg', 'Đã có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại: ' + err.message);
        res.status(500).render('user/checkout', {
            layout: 'user/layouts/main',
            title: 'Thanh toán Đơn hàng',
            cartItems: cartItemsForError,
            cartTotal: cartTotalForError,
            checkoutData: value,
            errors: { general: 'Lỗi server khi tạo đơn hàng.' },
            hasUnavailableProduct: cartItemsForError.some(item => !item.Product || item.quantity > item.Product.stock_quantity)
        });
    }
};

// GET: Hiển thị danh sách đơn hàng của người dùng
exports.getUserOrders = async (req, res) => {
    try {
        const userId = req.user.id;
        const orders = await Order.findAll({
            where: { user_id: userId },
            order: [['order_date', 'DESC']], // Hoặc createdAt
            include: [{ // Tùy chọn: include một vài order details để hiển thị ảnh sản phẩm đầu tiên
                model: OrderDetail,
                as: 'details',
                limit: 1, // Chỉ lấy 1 detail để lấy ảnh
                include: [{model: Product, attributes:['image_url']}]
            }]
        });

        res.render('user/orders', {
            layout: 'user/layouts/main',
            title: 'Lịch sử Đơn hàng',
            orders: orders.map(o => o.toJSON())
        });
    } catch (error) {
        logger.error(`User: Error fetching orders for user ID ${req.user.id}:`, error);
        req.flash('error_msg', 'Không thể tải lịch sử đơn hàng.');
        res.redirect('/');
    }
};

// GET: Hiển thị chi tiết một đơn hàng của người dùng
exports.getUserOrderDetail = async (req, res) => {
    try {
        const userId = req.user.id;
        const orderId = req.params.id;

        const order = await Order.findOne({
            where: { id: orderId, user_id: userId }, // Đảm bảo đơn hàng thuộc về user
            include: [
                { model: User, attributes: ['name', 'email'] }, // Không cần thiết vì đã có req.user
                {
                    model: OrderDetail,
                    as: 'details',
                    include: [{ model: Product, attributes: ['id', 'name', 'image_url'] }]
                }
            ]
        });

        if (!order) {
            req.flash('error_msg', 'Đơn hàng không tồn tại hoặc bạn không có quyền xem.');
            return res.redirect('/orders');
        }

        res.render('user/order-detail', {
            layout: 'user/layouts/main',
            title: `Chi tiết Đơn hàng #${order.id}`,
            order: order.toJSON()
        });
    } catch (error) {
        logger.error(`User: Error fetching order detail ID ${req.params.id} for user ID ${req.user.id}:`, error);
        req.flash('error_msg', 'Lỗi khi tải chi tiết đơn hàng.');
        res.redirect('/orders');
    }
};