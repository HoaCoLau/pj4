const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Book = sequelize.define('Book', {
  title: { type: DataTypes.STRING, allowNull: false },
  price: { type: DataTypes.FLOAT, allowNull: false },
  genre_id: { type: DataTypes.INTEGER },
  image: { type: DataTypes.STRING },
  decription: { type: DataTypes.TEXT },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  }
}, {
  tableName: 'books',
  timestamps: false
});

module.exports = Book;
