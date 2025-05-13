// controllers/client/orderController.js
const db = require('../../models');
const Order = db.order;
const OrderDetail = db.orderDetail;
const Cart = db.cart;
const CartDetail = db.cartDetail;
const Product = db.product;
// const logger = require('../../config/logger');
const Joi = require('joi');

// Schema validation khi tạo đơn hàng từ giỏ hàng
const createOrderSchema = Joi.object({
    shipping_address: Joi.string().required().messages({'any.required': 'Địa chỉ giao hàng là bắt buộc.'}),
    billing_address: Joi.string().allow('').optional(),
    payment_method: Joi.string().valid('cod', 'transfer').required().messages({'any.only': 'Phương thức thanh toán không hợp lệ.', 'any.required': 'Phương thức thanh toán là bắt buộc.'}), // Ví dụ: cod, transfer
    notes: Joi.string().allow('').optional(),
});


// Hiển thị lịch sử đơn hàng của người dùng (Client)
exports.index = async (req, res) => {
    try {
        const userId = req.user.id;

        const orders = await Order.findAll({
            where: { user_id: userId },
            order: [['order_date', 'DESC']], // Sắp xếp đơn hàng mới nhất lên đầu
            include: [{
                 model: OrderDetail,
                 include: Product // Lấy thông tin sản phẩm trong chi tiết đơn hàng
             }]
        });

        res.render('client/orders/index', {
            title: 'Đơn hàng của tôi',
            orders,
             // res.locals.user đã có
        });
    } catch (err) {
        console.error('Lỗi lấy lịch sử đơn hàng:', err);
        // logger.error(`Client Order History Error: ${err.message}`);
        res.status(500).send('Lỗi máy chủ khi lấy lịch sử đơn hàng.');
    }
};

// Hiển thị chi tiết đơn hàng của người dùng (Client)
exports.detail = async (req, res) => {
    try {
        const userId = req.user.id;
        const orderId = req.params.id;

        const order = await Order.findOne({
            where: { id: orderId, user_id: userId }, // Chỉ lấy đơn hàng của user hiện tại
            include: [{
                model: OrderDetail,
                include: Product // Lấy thông tin sản phẩm
            }]
        });

        if (!order) {
             // logger.warn(`Client Order Detail: Order ${orderId} not found or doesn't belong to user ${userId}.`);
            return res.status(404).send('Đơn hàng không tồn tại.');
        }

        res.render('client/orders/detail', {
            title: 'Chi tiết Đơn hàng',
            order,
             // res.locals.user đã có
        });
    } catch (err) {
        console.error('Lỗi lấy chi tiết đơn hàng:', err);
        // logger.error(`Client Order Detail Error: ${err.message}`);
        res.status(500).send('Lỗi máy chủ khi lấy chi tiết đơn hàng.');
    }
};

// Hiển thị trang thanh toán / xác nhận đơn hàng từ giỏ hàng (Client)
// Có thể lấy thông tin giỏ hàng ở đây để hiển thị lại cho người dùng xác nhận
exports.showCheckout = async (req, res) => {
     try {
        const userId = req.user.id;

         const cart = await Cart.findOne({
             where: { user_id: userId },
             include: {
                 model: CartDetail,
                 include: Product
             }
         });

         if (!cart || !cart.CartDetails || cart.CartDetails.length === 0) {
              return res.redirect('/cart?error=' + encodeURIComponent('Giỏ hàng trống.'));
         }

         // Tính tổng tiền giỏ hàng
        let total = 0;
        if (cart && cart.CartDetails) {
            total = cart.CartDetails.reduce((sum, item) => sum + (item.quantity * item.price_at_addition), 0);
        }


         res.render('client/checkout/index', { // Cần tạo view checkout/index.ejs
             title: 'Thanh toán',
             cart,
             total,
             error: null,
             oldInput: {}
              // res.locals.user đã có
         });

     } catch (err) {
         console.error('Lỗi hiển thị trang thanh toán:', err);
          // logger.error(`Client Show Checkout Error: ${err.message}`);
         res.status(500).send('Lỗi máy chủ khi tải trang thanh toán.');
     }
};


// Tạo đơn hàng từ giỏ hàng (Client)
exports.createOrderFromCart = async (req, res) => {
    const userId = req.user.id;
     const { error, value } = createOrderSchema.validate(req.body, { abortEarly: false });

     if (error) {
         const errors = error.details.map(detail => detail.message);
          // Cần lấy lại giỏ hàng để hiển thị lại trang checkout với lỗi
         const cart = await Cart.findOne({
              where: { user_id: userId },
              include: { model: CartDetail, include: Product }
         });
          let total = 0;
         if (cart && cart.CartDetails) {
             total = cart.CartDetails.reduce((sum, item) => sum + (item.quantity * item.price_at_addition), 0);
         }
         return res.render('client/checkout/index', {
             title: 'Thanh toán',
             cart,
             total,
             error: errors,
             oldInput: req.body
         });
     }

    try {
        // Lấy thông tin giỏ hàng của user
        const cart = await Cart.findOne({
            where: { user_id: userId },
            include: CartDetail
        });

        if (!cart || !cart.CartDetails || cart.CartDetails.length === 0) {
             // logger.warn(`Client Create Order: Cart is empty for user ${userId}.`);
            return res.redirect('/cart?error=' + encodeURIComponent('Giỏ hàng trống, không thể tạo đơn hàng.'));
        }

        // Bắt đầu transaction để đảm bảo tính toàn vẹn dữ liệu
        const t = await db.sequelize.transaction();

        try {
            // Tính tổng tiền và kiểm tra tồn kho (có thể cần kiểm tra lại)
            let totalAmount = 0;
            const orderDetailsToCreate = [];
            const productsToUpdate = []; // Để cập nhật lại số lượng tồn kho

            for (const item of cart.CartDetails) {
                 const product = await Product.findByPk(item.product_id, { transaction: t });

                 if (!product) {
                      // Nếu sản phẩm trong giỏ đã bị xóa khỏi database
                      throw new Error(`Sản phẩm "${item.product_name || item.product_id}" không còn tồn tại.`);
                 }

                 if (product.stock_quantity < item.quantity) {
                     // Nếu số lượng tồn kho không đủ
                      throw new Error(`Sản phẩm "${product.name}" chỉ còn ${product.stock_quantity} sản phẩm trong kho.`);
                 }

                totalAmount += item.quantity * item.price_at_addition;

                orderDetailsToCreate.push({
                    product_id: item.product_id,
                    quantity: item.quantity,
                    price_at_order: item.price_at_addition, // Sử dụng giá khi thêm vào giỏ
                    product_name: product.name // Lưu lại tên sản phẩm hiện tại
                });

                // Chuẩn bị cập nhật tồn kho
                productsToUpdate.push({
                     product: product,
                     new_stock: product.stock_quantity - item.quantity
                });
            }

            // Tạo đơn hàng mới
            const newOrder = await Order.create({
                user_id: userId,
                total_amount: totalAmount,
                shipping_address: value.shipping_address,
                billing_address: value.billing_address || value.shipping_address, // Nếu không có billing, dùng shipping
                payment_method: value.payment_method,
                notes: value.notes,
                status: 'pending', // Trạng thái ban đầu là pending
            }, { transaction: t });

            // Thêm OrderDetails cho đơn hàng vừa tạo
            for (const detail of orderDetailsToCreate) {
                 await OrderDetail.create({
                     order_id: newOrder.id,
                     product_id: detail.product_id,
                     quantity: detail.quantity,
                     price_at_order: detail.price_at_order,
                     product_name: detail.product_name
                 }, { transaction: t });
            }

             // Cập nhật số lượng tồn kho
            for (const update of productsToUpdate) {
                 await update.product.update({ stock_quantity: update.new_stock }, { transaction: t });
            }


            // Xóa giỏ hàng và chi tiết giỏ hàng của user sau khi tạo đơn hàng thành công
            await CartDetail.destroy({ where: { cart_id: cart.id }, transaction: t });
            // Không cần xóa Cart, chỉ xóa CartDetails (do Cart liên kết 1-1 với User)
            // await cart.destroy({ transaction: t });


            // Commit transaction
            await t.commit();

            // logger.info(`Order ${newOrder.id} created for user ${userId}`);

            // Redirect đến trang xem chi tiết đơn hàng vừa tạo
            res.redirect('/orders/' + newOrder.id + '?success=' + encodeURIComponent('Đặt hàng thành công!'));

        } catch (transactionError) {
            // Rollback transaction nếu có lỗi
            await t.rollback();
            console.error('Lỗi khi tạo đơn hàng (Transaction rolled back):', transactionError);
            // logger.error(`Client Create Order Transaction Error for user ${userId}: ${transactionError.message}`);

            // Lấy lại thông tin giỏ hàng để hiển thị lại trang checkout với lỗi
            const cart = await Cart.findOne({
                 where: { user_id: userId },
                 include: { model: CartDetail, include: Product }
            });
             let total = 0;
            if (cart && cart.CartDetails) {
                total = cart.CartDetails.reduce((sum, item) => sum + (item.quantity * item.price_at_addition), 0);
            }

            res.render('client/checkout/index', {
                title: 'Thanh toán',
                cart,
                total,
                error: [transactionError.message], // Hiển thị lỗi từ transaction (ví dụ: thiếu hàng)
                oldInput: req.body
            });
        }

    } catch (err) {
        console.error('Lỗi tổng quát khi tạo đơn hàng:', err);
        // logger.error(`Client Create Order General Error for user ${userId}: ${err.message}`);
        // Lấy lại thông tin giỏ hàng để hiển thị lại trang checkout với lỗi
         const cart = await Cart.findOne({
              where: { user_id: userId },
              include: { model: CartDetail, include: Product }
         });
          let total = 0;
         if (cart && cart.CartDetails) {
             total = cart.CartDetails.reduce((sum, item) => sum + (item.quantity * item.price_at_addition), 0);
         }
         res.render('client/checkout/index', {
             title: 'Thanh toán',
             cart,
             total,
             error: ['Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại.'],
             oldInput: req.body
         });
    }
};