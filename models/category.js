// models/category.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const Category = sequelize.define('Category', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    }
  }, {
    tableName: 'categories',
    timestamps: false // Dựa theo SQL file
  });

  return Category;
};