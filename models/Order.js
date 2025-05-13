// models/Order.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  // userId được quản lý qua association
  // userId: { type: DataTypes.INTEGER, allowNull: true },
  orderDate: { // Map tới order_date
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  totalAmount: { // Map tới total_amount
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0.00,
    validate: {
        isDecimal: true,
        min: 0
    }
  },
  status: {
    type: DataTypes.ENUM('pending','processing','shipped','delivered','cancelled','refunded'),
    allowNull: false,
    defaultValue: 'pending'
  },
  shippingAddress: { // Map tới shipping_address
    type: DataTypes.TEXT,
    allowNull: true
  },
  billingAddress: { // Map tới billing_address
    type: DataTypes.TEXT,
    allowNull: true
  },
  paymentMethod: { // Map tới payment_method
    type: DataTypes.STRING(50),
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  // createdAt (order_date) và updatedAt được Sequelize quản lý
}, {
  tableName: 'orders',
  timestamps: true, // Bật timestamps
  underscored: true // Map tới created_at, updated_at (order_date có default riêng)
});

module.exports = Order;