const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('pj3', 'root', '', {
  host: 'localhost',
  dialect: 'mysql',
  logging: false
});

module.exports = sequelize;
