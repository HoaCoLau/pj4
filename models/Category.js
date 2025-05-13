// models/Category.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Category = sequelize.define('Category', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(100), // VARCHAR(100) trong SQL
    allowNull: false,
    unique: { // Tên category nên là duy nhất
        msg: 'Category name already exists.'
    },
    validate: {
        notEmpty: { msg: 'Category name cannot be empty.' }
    }
  }
}, {
  tableName: 'categories',
  timestamps: false // Bảng này không có cột timestamps trong SQL
});

module.exports = Category;