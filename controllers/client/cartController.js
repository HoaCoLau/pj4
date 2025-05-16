// controllers/client/cartController.js
const db = require('../../models');
const Cart = db.cart;
const CartDetail = db.cartDetail;
const Product = db.product;
// const logger = require('../../config/logger');
const Joi = require('joi');

const updateCartSchema = Joi.object({
    quantity: Joi.number().integer().min(1).required().messages({
         'any.required': 'Số lượng là bắt buộc.',
         'number.integer': 'Số lượng phải là số nguyên.',
         'number.min': 'Số lượng phải ít nhất là 1.'
    }),
});

// Hiển thị giỏ hàng của người dùng (Client)
exports.index = async (req, res) => {
    try {
        const userId = req.user.id; // Lấy user ID từ req.user (do middleware authenticate cung cấp)

        // Tìm giỏ hàng của user và lấy chi tiết giỏ hàng cùng thông tin sản phẩm
        const cart = await Cart.findOne({
            where: { user_id: userId },
            include: {
                model: CartDetail,
                include: Product // Lấy thông tin sản phẩm
            }
        });

        // Tính tổng tiền giỏ hàng (Tùy chọn, có thể tính ở view)
        let total = 0;
        if (cart && cart.CartDetails) {
            total = cart.CartDetails.reduce((sum, item) => sum + (item.quantity * parseFloat(item.price_at_addition)), 0); // Chuyển đổi Decimal sang Number
        }


        res.render('client/cart/index', {
            title: 'Giỏ hàng của bạn',
            cart,
            total,
             error: req.query.error // Lấy lỗi từ redirect
            // res.locals.user đã có
        });
    } catch (err) {
        console.error('Lỗi lấy thông tin giỏ hàng:', err);
        // logger.error(`Client Cart Index Error: ${err.message}`);
        res.redirect('/');
    }
};

// Thêm sản phẩm vào giỏ hàng (Client)
exports.addToCart = async (req, res) => {
    const productId = req.body.productId; // Lấy ID sản phẩm từ request body
    const quantity = parseInt(req.body.quantity, 10) || 1; // Lấy số lượng (mặc định là 1)
    const userId = req.user.id;

     if (!productId || quantity < 1) {
          return res.redirect('/products?error=' + encodeURIComponent('Thông tin sản phẩm không hợp lệ.'));
     }

    try {
        // Tìm giỏ hàng của user, hoặc tạo mới nếu chưa có (middleware auth đảm bảo user đã đăng nhập)
        let cart = await Cart.findOne({ where: { user_id: userId } });

        if (!cart) {
            cart = await Cart.create({ user_id: userId });
             // logger.info(`Created new cart for user ${userId}`);
        }

        // Tìm sản phẩm để lấy giá và kiểm tra tồn kho
        const product = await Product.findByPk(productId);
        if (!product) {
             // logger.warn(`Client Add to Cart: Product ${productId} not found.`);
            return res.redirect('/products?error=' + encodeURIComponent('Sản phẩm không tồn tại.'));
        }

        // Kiểm tra tồn kho (tùy thuộc vào logic kinh doanh)
        // if (product.stock_quantity < quantity) {
        //      return res.redirect('/products/' + productId + '?error=' + encodeURIComponent('Số lượng sản phẩm trong kho không đủ.'));
        // }


        // Tìm chi tiết sản phẩm trong giỏ hàng
        const cartDetail = await CartDetail.findOne({
            where: { cart_id: cart.id, product_id: productId }
        });

        if (cartDetail) {
            // Nếu sản phẩm đã có trong giỏ, cập nhật số lượng
            await cartDetail.update({
                quantity: cartDetail.quantity + quantity
                 // Lưu ý: Không cập nhật price_at_addition khi thêm lần 2
            });
             // logger.info(`Updated quantity for product ${productId} in cart ${cart.id}`);
        } else {
            // Nếu sản phẩm chưa có, thêm mới vào chi tiết giỏ hàng
            await CartDetail.create({
                cart_id: cart.id,
                product_id: productId,
                quantity: quantity,
                price_at_addition: product.price // Lưu giá sản phẩm tại thời điểm thêm
            });
             // logger.info(`Added product ${productId} to cart ${cart.id}`);
        }

        // Redirect về trang giỏ hàng hoặc trang sản phẩm
        res.redirect('/cart?success=' + encodeURIComponent('Đã thêm sản phẩm vào giỏ hàng.'));

    } catch (err) {
        console.error('Lỗi khi thêm sản phẩm vào giỏ:', err);
        // logger.error(`Client Add to Cart Error: ${err.message}`);
        res.redirect('/products?error=' + encodeURIComponent('Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng.'));
    }
};

// Cập nhật số lượng sản phẩm trong giỏ hàng (Client) - Sửa để trả về JSON cho AJAX
exports.updateCartItem = async (req, res) => {
    const cartDetailId = req.params.id; // ID của CartDetail
    // Joi validate req.body (đã được parse bởi express.json())
    const { error, value } = updateCartSchema.validate(req.body);
    const userId = req.user.id;


    if (error) {
         // Trả về JSON lỗi cho AJAX
         return res.status(400).json({
             error: 'Validation Error',
             message: error.details[0].message
         });
    }

    try {
        const cartDetail = await CartDetail.findOne({
            where: { id: cartDetailId },
            include: {
                model: Cart,
                where: { user_id: userId } // Đảm bảo CartDetail thuộc về giỏ hàng của user hiện tại
            }
        });

        if (!cartDetail) {
             // logger.warn(`Client Update Cart Item: CartDetail ${cartDetailId} not found or doesn't belong to user ${userId}.`);
             // Trả về JSON lỗi cho AJAX
            return res.status(404).json({
                error: 'Not Found',
                message: 'Mục giỏ hàng không tồn tại.'
            });
        }

        const { quantity } = value;

        // Kiểm tra tồn kho khi cập nhật số lượng (tùy chọn)
        // const product = await Product.findByPk(cartDetail.product_id);
        // if (product && product.stock_quantity < quantity) {
        //      return res.status(400).json({
        //          error: 'Stock Error',
        //          message: `Số lượng trong kho không đủ cho sản phẩm ${(product.name || 'này')}. Chỉ còn ${product.stock_quantity} sản phẩm.`
        //      });
        // }


        await cartDetail.update({ quantity: quantity });

        // logger.info(`Updated quantity for cart item ${cartDetailId} to ${quantity}`);

        // Trả về JSON thành công cho AJAX
        res.status(200).json({
            success: true,
            message: 'Cập nhật số lượng thành công.'
        });

    } catch (err) {
        console.error('Lỗi khi cập nhật giỏ hàng:', err);
        // logger.error(`Client Update Cart Item Error: ${err.message}`);
         // Trả về JSON lỗi cho AJAX
        res.status(500).json({
            error: 'Server Error',
            message: 'Có lỗi xảy ra khi cập nhật giỏ hàng. Vui lòng thử lại.'
        });
    }
};

// Xóa sản phẩm khỏi giỏ hàng (Client)
exports.removeCartItem = async (req, res) => {
    const cartDetailId = req.params.id;
    const userId = req.user.id;

    try {
        const cartDetail = await CartDetail.findOne({
            where: { id: cartDetailId },
             include: {
                 model: Cart,
                 where: { user_id: userId } // Đảm bảo CartDetail thuộc về giỏ hàng của user hiện tại
             }
        });

        if (!cartDetail) {
             // logger.warn(`Client Remove Cart Item: CartDetail ${cartDetailId} not found or doesn't belong to user ${userId}.`);
            return res.redirect('/cart?error=' + encodeURIComponent('Mục giỏ hàng không tồn tại.'));
        }

        await cartDetail.destroy();

        // logger.info(`Removed cart item ${cartDetailId} from cart of user ${userId}`);

        res.redirect('/cart?success=' + encodeURIComponent('Đã xóa sản phẩm khỏi giỏ hàng.'));

    } catch (err) {
        console.error('Lỗi khi xóa sản phẩm khỏi giỏ:', err);
        // logger.error(`Client Remove Cart Item Error: ${err.message}`);
        res.redirect('/cart?error=' + encodeURIComponent('Có lỗi xảy ra khi xóa sản phẩm khỏi giỏ hàng.'));
    }
};
