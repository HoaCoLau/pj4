const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  name: { type: DataTypes.STRING, allowNull: false },
  image: { type: DataTypes.STRING, Null: false },
  password: { type: DataTypes.STRING, allowNull: false },
  role: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'user'
  }
}, {
  tableName: 'users',
  timestamps: false
});

module.exports = User;
