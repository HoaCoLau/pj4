// models/order.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define('Order', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true, // Dựa theo SQL file có thể NULL
      references: {
        model: 'users',
        key: 'id'
      }
    },
    order_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    total_amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    status: {
      type: DataTypes.ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'),
      allowNull: false,
      defaultValue: 'pending'
    },
    shipping_address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    billing_address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    payment_method: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      onUpdate: DataTypes.NOW
    }
  }, {
    tableName: 'orders',
    timestamps: false // Dựa theo SQL file
  });

  return Order;
};