// models/user.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    image: {
      type: DataTypes.TEXT, // Kiểu TEXT để lưu đường dẫn ảnh
      allowNull: true
    },
    role: {
      type: DataTypes.ENUM('admin', 'user'),
      allowNull: false,
      defaultValue: 'user'
    }
  }, {
    tableName: 'users',
    timestamps: false // Dựa theo SQL file không có cột created_at, updated_at cho bảng users
  });

  return User;
};