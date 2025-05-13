// models/Product.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING, // VARCHAR(255)
    allowNull: false,
    validate: {
        notEmpty: { msg: 'Product name cannot be empty.' }
    }
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
        isDecimal: { msg: 'Price must be a decimal number.' },
        min: { args: [0.01], msg: 'Price must be positive.'} // Giá phải lớn hơn 0
    }
  },
  // categoryId được Sequelize quản lý qua association, không cần khai báo lại trừ khi muốn tùy chỉnh
  // categoryId: {
  //   type: DataTypes.INTEGER,
  //   allowNull: true // Do ON DELETE SET NULL trong SQL
  // },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  imageUrl: { // Tự động map tới cột image_url do underscored: true
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
        // isUrl: { msg: 'Image URL must be a valid URL format.' } // Bỏ comment nếu muốn validate URL
    }
  },
  stockQuantity: { // Tự động map tới stock_quantity
    type: DataTypes.INTEGER,
    allowNull: false, // Mặc định là 0 trong SQL, không nên null
    defaultValue: 0,
     validate: {
        isInt: { msg: 'Stock quantity must be an integer.' },
        min: { args: [0], msg: 'Stock quantity cannot be negative.' }
    }
  },
  // createdAt và updatedAt được Sequelize quản lý (map tới created_at, updated_at)
}, {
  tableName: 'products',
  timestamps: true, // Cho phép Sequelize quản lý createdAt, updatedAt
  underscored: true // Đảm bảo map tới created_at, updated_at
});

module.exports = Product;