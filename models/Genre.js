const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Genre = sequelize.define('Genre', {
  name: { type: DataTypes.STRING, allowNull: false },
}, {
  tableName: 'genres',
  timestamps: false,
});

module.exports = Genre;