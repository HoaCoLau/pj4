// models/index.js
const sequelize = require('../config/db');
const { Sequelize } = require('sequelize');

// Import các models đã định nghĩa
const User = require('./User');
const Category = require('./Category');
const Product = require('./Product');
const Order = require('./Order');
const OrderDetail = require('./OrderDetail');
const Cart = require('./Cart');           // <--- THÊM MỚI
const CartDetail = require('./CartDetail'); // <--- THÊM MỚI

// --- Định nghĩa Associations (Mối quan hệ) ---

// User <-> Order (Giữ nguyên)
User.hasMany(Order, { foreignKey: 'userId', as: 'orders', onDelete: 'SET NULL', onUpdate: 'CASCADE' });
Order.belongsTo(User, { foreignKey: 'userId', as: 'customer' });

// Category <-> Product (Giữ nguyên)
Category.hasMany(Product, { foreignKey: 'categoryId', as: 'products', onDelete: 'SET NULL', onUpdate: 'CASCADE' });
Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

// Order <-> OrderDetail (Giữ nguyên)
Order.hasMany(OrderDetail, { foreignKey: 'orderId', as: 'details', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
OrderDetail.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

// Product <-> OrderDetail (Giữ nguyên)
Product.hasMany(OrderDetail, { foreignKey: 'productId', as: 'orderDetails', onDelete: 'SET NULL', onUpdate: 'CASCADE' });
OrderDetail.belongsTo(Product, { foreignKey: 'productId', as: 'product' });


// --- THÊM ASSOCIATIONS CHO CART ---
// User <-> Cart (Một User có một Cart - do user_id trong carts là UNIQUE)
// Foreign Key: user_id trong bảng carts
User.hasOne(Cart, {
    foreignKey: 'userId',
    as: 'cart',
    onDelete: 'CASCADE', // Nếu User bị xóa, Cart cũng bị xóa
    onUpdate: 'CASCADE'
});
Cart.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
});

// Cart <-> CartDetail (Một Cart có nhiều CartDetail)
// Foreign Key: cart_id trong bảng cart_details
Cart.hasMany(CartDetail, {
    foreignKey: 'cartId',
    as: 'items', // cart.getItems()
    onDelete: 'CASCADE', // Nếu Cart bị xóa, các CartDetail cũng bị xóa
    onUpdate: 'CASCADE'
});
CartDetail.belongsTo(Cart, {
    foreignKey: 'cartId',
    as: 'cart'
});

// Product <-> CartDetail (Một Product có trong nhiều CartDetail)
// Foreign Key: product_id trong bảng cart_details
Product.hasMany(CartDetail, {
    foreignKey: 'productId',
    as: 'cartItems', // product.getCartItems()
    onDelete: 'CASCADE', // Nếu Product bị xóa, các CartDetail liên quan cũng bị xóa
    onUpdate: 'CASCADE'
});
CartDetail.belongsTo(Product, {
    foreignKey: 'productId',
    as: 'product' // cartDetail.getProduct()
});
// --- KẾT THÚC THÊM ASSOCIATIONS CHO CART ---


// --- Exports ---
const db = {
  sequelize,
  Sequelize,
  User,
  Category,
  Product,
  Order,
  OrderDetail,
  Cart,           // <--- THÊM MỚI
  CartDetail      // <--- THÊM MỚI
};

module.exports = db;