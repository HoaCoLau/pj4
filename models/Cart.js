// models/Cart.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Cart = sequelize.define('Cart', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  // userId sẽ được định nghĩa thông qua association
  // và trong SQL, user_id là UNIQUE, nghĩa là mỗi user chỉ có 1 cart active.
  // createdAt và updatedAt được Sequelize quản lý (khớp với created_at, updated_at trong SQL)
}, {
  tableName: 'carts',
  timestamps: true, // Cho phép Sequelize quản lý createdAt, updatedAt
  underscored: true // Để map tới created_at, updated_at
});

module.exports = Cart;