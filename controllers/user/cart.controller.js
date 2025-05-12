const db = require("../../models");
const Cart = db.carts;
const CartDetail = db.cartDetails;
const Product = db.products;
const { addItemSchema, updateItemSchema } = require("../../validation/cart.validation.js");
const logger = require('../../config/logger');

// Render trang giỏ hàng
exports.viewCart = async (req, res) => {
    const userId = res.locals.user.id;
    req.log.info(`Rendering user cart view for user ${userId}`);
    try {
        const cart = await Cart.findOne({
            where: { user_id: userId },
            include: [{
                model: CartDetail, as: 'cartDetails',
                include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'price', 'image_url'] }]
            }]
        });
        res.render("user/cart/index", { title: "Giỏ hàng của bạn", cart: cart });
    } catch (err) {
        req.log.error({ err }, `Lỗi khi lấy giỏ hàng cho user ${userId}.`);
        res.status(500).render("user/errorPage", { title: "Lỗi Server", message: "Đã xảy ra lỗi khi tải giỏ hàng." });
    }
};

// Xử lý thêm sản phẩm vào giỏ hàng (POST)
exports.addItemToCartProcess = async (req, res) => {
    const userId = res.locals.user.id;
    const { error, value } = addItemSchema.validate(req.body);
    if (error) {
        logger.warn(`Validation failed for adding item to cart (user ${userId}): ${error.details[0].message}`);
        return res.redirect(req.headers.referer || '/products?error=Dữ liệu thêm vào giỏ hàng không hợp lệ.');
    }
    const { product_id, quantity = 1 } = value;
    try {
        const [cart, created] = await Cart.findOrCreate({ where: { user_id: userId }, defaults: { user_id: userId } });
        const product = await Product.findByPk(product_id);
        if (!product) {
            logger.warn(`Product not found for adding to cart: ${product_id} (user ${userId})`);
            return res.redirect(req.headers.referer || '/products?error=Sản phẩm không tồn tại.');
        }
        const cartDetail = await CartDetail.findOne({ where: { cart_id: cart.id, product_id: product_id } });
        if (cartDetail) {
            await cartDetail.update({ quantity: cartDetail.quantity + quantity, price_at_addition: product.price });
            req.log.info(`Updated quantity for product ${product_id} in cart ${cart.id} (user ${userId})`);
        } else {
            await CartDetail.create({ cart_id: cart.id, product_id: product_id, quantity: quantity, price_at_addition: product.price });
             req.log.info(`Added new product ${product_id} to cart ${cart.id} (user ${userId})`);
        }
        res.redirect("/user/cart?success=Đã thêm sản phẩm vào giỏ hàng!");
    } catch (err) {
        req.log.error({ err }, `Lỗi khi thêm sản phẩm ${product_id} vào giỏ hàng cho user ${userId}.`);
        res.redirect(req.headers.referer || '/products?error=Đã xảy ra lỗi khi thêm sản phẩm vào giỏ hàng.');
    }
};

// Xử lý cập nhật số lượng sản phẩm trong giỏ (POST với method-override PUT)
exports.updateItemQuantityProcess = async (req, res) => {
    const userId = res.locals.user.id;
    const cartDetailId = req.params.cartDetailId;
    const { error, value } = updateItemSchema.validate(req.body);
    if (error) {
        logger.warn(`Validation failed for updating cart item ${cartDetailId} (user ${userId}): ${error.details[0].message}`);
        return res.redirect("/user/cart?error=Số lượng không hợp lệ.");
    }
    const { quantity } = value;
    try {
        const cartDetail = await CartDetail.findOne({ where: { id: cartDetailId }, include: [{ model: Cart, as: 'cart', where: { user_id: userId } }] });
        if (!cartDetail) {
            logger.warn(`Cart detail not found for update: ${cartDetailId} (user ${userId})`);
            return res.redirect("/user/cart?error=Không tìm thấy sản phẩm trong giỏ hàng.");
        }
        if (quantity <= 0) {
            await cartDetail.destroy();
            req.log.info(`Removed cart item ${cartDetailId} due to quantity <= 0 (user ${userId})`);
             res.redirect("/user/cart?success=Đã xóa sản phẩm khỏi giỏ hàng.");
        } else {
            await cartDetail.update({ quantity: quantity });
            req.log.info(`Updated quantity for cart item ${cartDetailId} to ${quantity} (user ${userId})`);
             res.redirect("/user/cart?success=Đã cập nhật số lượng sản phẩm.");
        }
    } catch (err) {
        req.log.error({ err }, `Lỗi khi cập nhật số lượng sản phẩm trong giỏ hàng ${cartDetailId} cho user ${userId}.`);
        res.redirect("/user/cart?error=Đã xảy ra lỗi khi cập nhật giỏ hàng.");
    }
};

// Xử lý xóa sản phẩm khỏi giỏ (POST với method-override DELETE)
exports.removeItemFromCartProcess = async (req, res) => {
     const userId = res.locals.user.id;
     const cartDetailId = req.params.cartDetailId;
     req.log.info(`Attempting to remove cart item ${cartDetailId} for user ${userId}`);
     try {
        const deletedRows = await CartDetail.destroy({
            where: { id: cartDetailId, '$cart.user_id$': userId },
            include: [{ model: Cart, as: 'cart', attributes: [] }]
        });
        if (deletedRows === 1) {
            req.log.info(`Removed cart item ${cartDetailId} (user ${userId})`);
            res.redirect("/user/cart?success=Đã xóa sản phẩm khỏi giỏ hàng.");
        } else {
             logger.warn(`Cart detail not found for removal: ${cartDetailId} (user ${userId})`);
             res.redirect("/user/cart?error=Không tìm thấy sản phẩm trong giỏ hàng để xóa.");
        }
     } catch (err) {
        req.log.error({ err }, `Lỗi khi xóa sản phẩm khỏi giỏ hàng ${cartDetailId} cho user ${userId}.`);
        res.redirect("/user/cart?error=Đã xảy ra lỗi khi xóa sản phẩm khỏi giỏ hàng.");
     }
};
