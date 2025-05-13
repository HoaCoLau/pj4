// models/cart.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const Cart = sequelize.define('Cart', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true, // Mỗi user chỉ có 1 giỏ hàng
      references: {
        model: 'users',
        key: 'id'
      }
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      onUpdate: DataTypes.NOW
    }
  }, {
    tableName: 'carts',
    timestamps: false // Dựa theo SQL file
  });

  return Cart;
};