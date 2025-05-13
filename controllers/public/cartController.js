// controllers/public/cartController.js
const { Cart, CartDetail, Product, Category, User } = require('../../models');
const logger = require('../../config/logger');

// Helper function để lấy hoặc tạo giỏ hàng cho user
const getOrCreateCart = async (userId) => {
    let cart = await Cart.findOne({ where: { userId: userId } });
    if (!cart) {
        cart = await Cart.create({ userId: userId });
        logger.info(`Cart created for user ID: ${userId}`);
    }
    return cart;
};

// GET: Hiển thị giỏ hàng
exports.showCart = async (req, res, next) => {
    try {
        const userId = req.user.id; // Lấy từ authenticateToken middleware
        const cart = await getOrCreateCart(userId);

        const cartItems = await CartDetail.findAll({
            where: { cartId: cart.id },
            include: [{
                model: Product,
                as: 'product',
                attributes: ['id', 'name', 'price', 'imageUrl', 'stockQuantity'] // Lấy các trường cần thiết
            }],
            order: [['createdAt', 'ASC']] // Sắp xếp theo thứ tự thêm vào
        });

        let cartTotal = 0;
        cartItems.forEach(item => {
            // Nên tính tổng dựa trên priceAtAddition nếu giá sản phẩm có thể thay đổi
            // Hoặc luôn lấy giá hiện tại của sản phẩm
            cartTotal += item.quantity * (item.product ? item.product.price : item.priceAtAddition);
        });

        res.render('public/cart/index', {
            pageTitle: 'Your Shopping Cart',
            cartItems: cartItems,
            cartTotal: cartTotal,
            path: '/cart'
        });
    } catch (error) {
        logger.error({ err: error, userId: req.user?.id }, 'Error showing cart');
        next(error);
    }
};

// POST: Thêm sản phẩm vào giỏ hàng
exports.addToCart = async (req, res, next) => {
    const { productId, quantity } = req.body;
    const userId = req.user.id;
    const numQuantity = parseInt(quantity) || 1;

    try {
        const product = await Product.findByPk(productId);
        if (!product) {
            logger.warn(`Add to cart failed: Product ID ${productId} not found.`);
            // Thông báo lỗi cho người dùng (thay vì flash)
            return res.redirect(req.headers.referer || '/products?error=product_not_found');
        }

        if (product.stockQuantity < numQuantity) {
            logger.warn(`Add to cart failed: Insufficient stock for Product ID ${productId}. Requested: ${numQuantity}, Available: ${product.stockQuantity}`);
            return res.redirect(`/products/${productId}?error=insufficient_stock`);
        }

        const cart = await getOrCreateCart(userId);
        let cartItem = await CartDetail.findOne({
            where: { cartId: cart.id, productId: product.id }
        });

        if (cartItem) {
            // Sản phẩm đã có trong giỏ, cập nhật số lượng
            cartItem.quantity += numQuantity;
            if (cartItem.quantity > product.stockQuantity) {
                 logger.warn(`Add to cart (update qty) failed: Insufficient stock for Product ID ${productId}. Requested total: ${cartItem.quantity}`);
                 return res.redirect(`/cart?error=insufficient_stock_update&product=${product.name}`);
            }
            // Cập nhật giá tại thời điểm thêm (nếu cần thiết)
            // cartItem.priceAtAddition = product.price; // Cập nhật nếu giá có thể thay đổi
            await cartItem.save();
            logger.info(`Updated quantity for Product ID ${productId} in cart ID ${cart.id} for User ID ${userId}. New Qty: ${cartItem.quantity}`);
        } else {
            // Sản phẩm chưa có, tạo mới CartDetail
            await CartDetail.create({
                cartId: cart.id,
                productId: product.id,
                quantity: numQuantity,
                priceAtAddition: product.price // Lưu giá tại thời điểm thêm
            });
            logger.info(`Added Product ID ${productId} (Qty: ${numQuantity}) to cart ID ${cart.id} for User ID ${userId}`);
        }
        res.redirect('/cart?success=added');
    } catch (error) {
        logger.error({ err: error, userId, productId, quantity }, 'Error adding to cart');
        next(error);
    }
};

// POST: Cập nhật số lượng sản phẩm trong giỏ
exports.updateCartItem = async (req, res, next) => {
    const { cartDetailId } = req.params; // ID của CartDetail
    const { quantity } = req.body;
    const userId = req.user.id;
    const numQuantity = parseInt(quantity);

    if (isNaN(numQuantity) || numQuantity <= 0) {
        logger.warn(`Update cart item failed: Invalid quantity ${quantity} for CartDetail ID ${cartDetailId}`);
        return res.redirect('/cart?error=invalid_quantity');
    }

    try {
        const cartDetail = await CartDetail.findByPk(cartDetailId, {
            include: [
                { model: Cart, as: 'cart', where: { userId: userId } }, // Đảm bảo cart detail này thuộc user hiện tại
                { model: Product, as: 'product', attributes: ['id', 'stockQuantity', 'name']}
            ]
        });

        if (!cartDetail) {
            logger.warn(`Update cart item failed: CartDetail ID ${cartDetailId} not found or not belong to User ID ${userId}`);
            return res.redirect('/cart?error=item_not_found');
        }

        if (numQuantity > cartDetail.product.stockQuantity) {
             logger.warn(`Update cart item failed: Insufficient stock for Product ID ${cartDetail.productId}. Requested: ${numQuantity}, Available: ${cartDetail.product.stockQuantity}`);
             return res.redirect(`/cart?error=insufficient_stock_update&product=${cartDetail.product.name}`);
        }

        cartDetail.quantity = numQuantity;
        await cartDetail.save();
        logger.info(`Updated CartDetail ID ${cartDetailId} to quantity ${numQuantity} for User ID ${userId}`);
        res.redirect('/cart?success=updated');
    } catch (error) {
        logger.error({ err: error, userId, cartDetailId, quantity }, 'Error updating cart item');
        next(error);
    }
};

// POST: Xóa sản phẩm khỏi giỏ hàng
exports.removeCartItem = async (req, res, next) => {
    const { cartDetailId } = req.params; // ID của CartDetail
    const userId = req.user.id;

    try {
        const cartDetail = await CartDetail.findByPk(cartDetailId, {
            include: { model: Cart, as: 'cart', where: { userId: userId } }
        });

        if (!cartDetail) {
            logger.warn(`Remove cart item failed: CartDetail ID ${cartDetailId} not found or not belong to User ID ${userId}`);
            return res.redirect('/cart?error=item_not_found');
        }

        await cartDetail.destroy();
        logger.info(`Removed CartDetail ID ${cartDetailId} for User ID ${userId}`);
        res.redirect('/cart?success=removed');
    } catch (error) {
        logger.error({ err: error, userId, cartDetailId }, 'Error removing cart item');
        next(error);
    }
};