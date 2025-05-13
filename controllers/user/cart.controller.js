// controllers/user/cart.controller.js
const { Cart, CartDetail, Product, sequelize } = require('../../models');
const logger = require('../../config/logger.config');

// GET: Hiển thị giỏ hàng
exports.getCart = async (req, res) => {
    try {
        const userId = req.user.id; // Lấy từ middleware isLoggedIn
        let cart = await Cart.findOne({
            where: { user_id: userId },
            include: [{
                model: CartDetail,
                as: 'items', // Alias đã định nghĩa
                required: false, // LEFT JOIN để vẫn lấy cart nếu không có items
                include: [{ model: Product, attributes: ['id', 'name', 'price', 'image_url', 'stock_quantity'] }]
            }]
        });

        if (!cart) { // Nếu user chưa có cart, tạo mới
            cart = await Cart.create({ user_id: userId });
            cart.items = []; // Khởi tạo items rỗng
        }

        let cartTotal = 0;
        if (cart.items && cart.items.length > 0) {
            cart.items.forEach(item => {
                // Kiểm tra nếu sản phẩm còn tồn tại (có thể đã bị xóa)
                if (item.Product) {
                    item.subtotal = item.quantity * item.Product.price;
                    cartTotal += item.subtotal;
                } else {
                    item.subtotal = 0; // Hoặc đánh dấu sản phẩm không khả dụng
                    item.Product = { name: '[Sản phẩm không còn tồn tại]', price: 0, image_url: '/images/placeholder.png', stock_quantity: 0 };
                }
            });
        }


        res.render('user/cart', {
            layout: 'user/layouts/main',
            title: 'Giỏ hàng của bạn',
            cart: cart.toJSON(), // Chuyển cart và items sang plain object
            cartItems: cart.items ? cart.items.map(item => item.toJSON()) : [],
            cartTotal: cartTotal
        });
    } catch (error) {
        logger.error(`User: Error fetching cart for user ID ${req.user.id}:`, error);
        req.flash('error_msg', 'Không thể tải giỏ hàng. Vui lòng thử lại.');
        res.redirect('/');
    }
};

// POST: Thêm sản phẩm vào giỏ hàng
exports.addToCart = async (req, res) => {
    const productId = req.params.productId;
    const quantity = parseInt(req.body.quantity) || 1;
    const userId = req.user.id;

    if (quantity < 1) {
        req.flash('error_msg', 'Số lượng không hợp lệ.');
        return res.redirect(req.headers.referer || '/products');
    }

    try {
        const product = await Product.findByPk(productId);
        if (!product) {
            req.flash('error_msg', 'Sản phẩm không tồn tại.');
            return res.redirect('/products');
        }
        if (product.stock_quantity < quantity) {
            req.flash('error_msg', `Xin lỗi, chỉ còn ${product.stock_quantity} sản phẩm "${product.name}" trong kho.`);
            return res.redirect(req.headers.referer || `/products/${productId}`);
        }


        let cart = await Cart.findOne({ where: { user_id: userId } });
        if (!cart) {
            cart = await Cart.create({ user_id: userId });
        }

        let cartItem = await CartDetail.findOne({
            where: { cart_id: cart.id, product_id: productId }
        });

        if (cartItem) { // Sản phẩm đã có trong giỏ, cập nhật số lượng
            const newQuantity = cartItem.quantity + quantity;
            if (product.stock_quantity < newQuantity) {
                 req.flash('error_msg', `Không đủ số lượng tồn kho. Bạn đã có ${cartItem.quantity} trong giỏ, chỉ có thể thêm tối đa ${product.stock_quantity - cartItem.quantity} nữa.`);
                 return res.redirect(req.headers.referer || `/products/${productId}`);
            }
            cartItem.quantity = newQuantity;
            // cartItem.price_at_addition = product.price; // Cập nhật giá nếu cần (thường không)
            await cartItem.save();
        } else { // Sản phẩm chưa có, tạo mới
            await CartDetail.create({
                cart_id: cart.id,
                product_id: productId,
                quantity: quantity,
                price_at_addition: product.price // Lưu giá tại thời điểm thêm
            });
        }

        req.flash('success_msg', `Đã thêm "${product.name}" vào giỏ hàng.`);
        res.redirect(req.body.redirectTo || req.headers.referer || '/cart'); // Redirect về trang trước đó hoặc giỏ hàng

    } catch (error) {
        logger.error(`User: Error adding product ID ${productId} to cart:`, error);
        req.flash('error_msg', 'Lỗi khi thêm sản phẩm vào giỏ hàng.');
        res.redirect('/products');
    }
};

// POST: Cập nhật số lượng sản phẩm trong giỏ
exports.updateCartItem = async (req, res) => {
    const cartDetailId = req.params.cartDetailId;
    const quantity = parseInt(req.body.quantity);
    const userId = req.user.id;

    if (isNaN(quantity) || quantity < 0) { // Cho phép quantity = 0 để xóa
        req.flash('error_msg', 'Số lượng không hợp lệ.');
        return res.redirect('/cart');
    }

    try {
        const cartItem = await CartDetail.findOne({
            where: { id: cartDetailId },
            include: [
                { model: Cart, where: { user_id: userId }, required: true }, // Đảm bảo cartItem thuộc về user
                { model: Product, attributes: ['stock_quantity', 'name'] }
            ]
        });


        if (!cartItem) {
            req.flash('error_msg', 'Sản phẩm không có trong giỏ hàng của bạn.');
            return res.redirect('/cart');
        }

        if (quantity === 0) { // Nếu số lượng là 0, xóa item
            await cartItem.destroy();
            req.flash('success_msg', `Đã xóa "${cartItem.Product.name}" khỏi giỏ hàng.`);
        } else {
            if (cartItem.Product.stock_quantity < quantity) {
                req.flash('error_msg', `Xin lỗi, chỉ còn ${cartItem.Product.stock_quantity} sản phẩm "${cartItem.Product.name}" trong kho.`);
                return res.redirect('/cart');
            }
            cartItem.quantity = quantity;
            await cartItem.save();
            req.flash('success_msg', 'Đã cập nhật số lượng sản phẩm.');
        }
        res.redirect('/cart');
    } catch (error) {
        logger.error(`User: Error updating cart item ID ${cartDetailId}:`, error);
        req.flash('error_msg', 'Lỗi khi cập nhật giỏ hàng.');
        res.redirect('/cart');
    }
};

// POST: Xóa sản phẩm khỏi giỏ hàng
exports.removeCartItem = async (req, res) => {
    const cartDetailId = req.params.cartDetailId;
    const userId = req.user.id;

    try {
        const cartItem = await CartDetail.findOne({
            where: { id: cartDetailId },
            include: [{ model: Cart, where: { user_id: userId }, required: true }]
        });

        if (!cartItem) {
            req.flash('error_msg', 'Sản phẩm không có trong giỏ hàng.');
            return res.redirect('/cart');
        }
        await cartItem.destroy();
        req.flash('success_msg', 'Đã xóa sản phẩm khỏi giỏ hàng.');
        res.redirect('/cart');
    } catch (error) {
        logger.error(`User: Error removing cart item ID ${cartDetailId}:`, error);
        req.flash('error_msg', 'Lỗi khi xóa sản phẩm khỏi giỏ hàng.');
        res.redirect('/cart');
    }
};