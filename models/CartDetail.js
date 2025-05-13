// models/CartDetail.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const CartDetail = sequelize.define('CartDetail', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  // cartId và productId sẽ được định nghĩa thông qua association
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: {
      isInt: { msg: 'Quantity must be an integer.' },
      min: { args: [1], msg: 'Quantity must be at least 1.' }
    }
  },
  priceAtAddition: { // Map tới price_at_addition
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      isDecimal: { msg: 'Price at addition must be a decimal.' },
      min: { args: [0], msg: 'Price at addition cannot be negative.'}
    }
  },
  // addedAt được Sequelize quản lý (map tới added_at trong SQL)
  // Tuy nhiên, trong SQL của bạn added_at có DEFAULT CURRENT_TIMESTAMP
  // và không có ON UPDATE. Sequelize sẽ quản lý createdAt cho bản ghi này.
  // Nếu muốn giữ nguyên added_at với logic của SQL, bạn cần timestamps: true và underscored:true
  // và Sequelize sẽ tạo cột createdAt.
  // Hoặc bạn đặt tên trường là addedAt và timestamps:true, underscored:false.
  // Để đơn giản, chúng ta sẽ để Sequelize tạo createdAt cho CartDetail.
  // Nếu bạn muốn chính xác cột 'added_at' như SQL, cần tùy chỉnh thêm.
}, {
  tableName: 'cart_details',
  timestamps: true, // Sẽ tạo createdAt (tương đương added_at) và updatedAt
  underscored: true // Map tới created_at, updated_at
});

module.exports = CartDetail;