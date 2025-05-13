// models/product.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define('Product', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: true, // Dựa theo SQL file có thể NULL
      references: {
        model: 'categories', // Tên bảng
        key: 'id'
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    image_url: {
      type: DataTypes.TEXT, // Kiểu TEXT để lưu đường dẫn ảnh
      allowNull: true
    },
    stock_quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
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
    tableName: 'products',
    timestamps: false // Dựa theo SQL file, tự quản lý các cột timestamp
    // Nếu muốn Sequelize tự quản lý, đặt timestamps: true và bỏ định nghĩa created_at, updated_at ở trên
  });

  return Product;
};