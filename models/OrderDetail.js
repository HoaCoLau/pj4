// models/OrderDetail.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const OrderDetail = sequelize.define('OrderDetail', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  // orderId và productId được quản lý qua association
  // orderId: { type: DataTypes.INTEGER, allowNull: false },
  // productId: { type: DataTypes.INTEGER, allowNull: true },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
     validate: {
        isInt: true,
        min: { args: [1], msg: 'Quantity must be at least 1.' }
    }
  },
  priceAtOrder: { // Map tới price_at_order
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
     validate: {
        isDecimal: true,
        min: 0
    }
  },
  productName: { // Map tới product_name
    type: DataTypes.STRING, // VARCHAR(255)
    allowNull: false, // Giữ tên SP tại thời điểm đặt hàng
     validate: {
        notEmpty: { msg: 'Product name at order cannot be empty.' }
     }
  }
}, {
  tableName: 'order_details',
  timestamps: false // Bảng này không có timestamps trong SQL
});

module.exports = OrderDetail;