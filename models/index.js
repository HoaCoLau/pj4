// models/index.js
const sequelize = require('../config/db');
const { Sequelize } = require('sequelize'); // Chỉ import nếu cần DataTypes

// Import các models đã định nghĩa
const User = require('./User');
const Category = require('./Category');
const Product = require('./Product');
const Order = require('./Order');
const OrderDetail = require('./OrderDetail');

// --- Định nghĩa Associations (Mối quan hệ) ---

// User <-> Order (Một User có nhiều Order, một Order thuộc về một User)
// Foreign Key: user_id trong bảng orders
User.hasMany(Order, {
    foreignKey: 'userId',   // Tên FK trong bảng Order
    as: 'orders',           // Alias khi truy vấn Order từ User (user.getOrders())
    onDelete: 'SET NULL',   // Nếu User bị xóa, user_id trong Order thành NULL
    onUpdate: 'CASCADE'
});
Order.belongsTo(User, {
    foreignKey: 'userId',
    as: 'customer'          // Alias khi truy vấn User từ Order (order.getCustomer())
});

// Category <-> Product (Một Category có nhiều Product, một Product thuộc về một Category)
// Foreign Key: category_id trong bảng products
Category.hasMany(Product, {
    foreignKey: 'categoryId',
    as: 'products',
    onDelete: 'SET NULL',   // Nếu Category bị xóa, category_id trong Product thành NULL
    onUpdate: 'CASCADE'
});
Product.belongsTo(Category, {
    foreignKey: 'categoryId',
    as: 'category'
});

// Order <-> OrderDetail (Một Order có nhiều OrderDetail, một OrderDetail thuộc về một Order)
// Foreign Key: order_id trong bảng order_details
Order.hasMany(OrderDetail, {
    foreignKey: 'orderId',
    as: 'details',          // Alias: order.getDetails()
    onDelete: 'CASCADE',    // Nếu Order bị xóa, các OrderDetail liên quan cũng bị xóa
    onUpdate: 'CASCADE'
});
OrderDetail.belongsTo(Order, {
    foreignKey: 'orderId',
    as: 'order'
});

// Product <-> OrderDetail (Một Product có trong nhiều OrderDetail, một OrderDetail có một Product)
// Foreign Key: product_id trong bảng order_details
Product.hasMany(OrderDetail, {
    foreignKey: 'productId',
    as: 'orderDetails',
    onDelete: 'SET NULL',   // Nếu Product bị xóa, product_id trong OrderDetail thành NULL
    onUpdate: 'CASCADE'
});
OrderDetail.belongsTo(Product, {
    foreignKey: 'productId',
    as: 'product'
});


// --- Exports ---
const db = {
  sequelize, // Sequelize instance
  Sequelize, // Sequelize library
  User,
  Category,
  Product,
  Order,
  OrderDetail
};

// Đồng bộ hóa (tùy chọn, chỉ dùng khi cần thiết, đặc biệt lúc dev)
// db.sequelize.sync({ force: false }) // force: true sẽ xóa và tạo lại bảng
//   .then(() => console.log('Database synchronized'))
//   .catch(err => console.error('Error synchronizing database:', err));

module.exports = db; // Export object chứa mọi thứ