// models/index.js
const sequelize = require('../config/sequelize.config');
const { DataTypes, Sequelize: SequelizeConstructor } = require('sequelize');
const logger = require('../config/logger.config');

const db = {};

db.sequelize = sequelize;
db.Sequelize = SequelizeConstructor;

// Import models
db.User = require('./user.model.js')(sequelize, DataTypes);
db.Category = require('./category.model.js')(sequelize, DataTypes);
db.Product = require('./product.model.js')(sequelize, DataTypes);
db.Cart = require('./cart.model.js')(sequelize, DataTypes);
db.CartDetail = require('./cartDetail.model.js')(sequelize, DataTypes);
db.Order = require('./order.model.js')(sequelize, DataTypes);
db.OrderDetail = require('./orderDetail.model.js')(sequelize, DataTypes);

// --- Associations ---
// User - Cart (One-to-One, do user_id trong carts là UNIQUE)
db.User.hasOne(db.Cart, { foreignKey: 'user_id', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
db.Cart.belongsTo(db.User, { foreignKey: 'user_id' });

// Cart - CartDetail (One-to-Many)
db.Cart.hasMany(db.CartDetail, { as: 'items', foreignKey: 'cart_id', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
db.CartDetail.belongsTo(db.Cart, { foreignKey: 'cart_id' });

// Product - CartDetail
db.Product.hasMany(db.CartDetail, { foreignKey: 'product_id', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
db.CartDetail.belongsTo(db.Product, { foreignKey: 'product_id' });

// Category - Product (One-to-Many)
db.Category.hasMany(db.Product, { foreignKey: 'category_id', onDelete: 'SET NULL', onUpdate: 'CASCADE' });
db.Product.belongsTo(db.Category, { as: 'category', foreignKey: 'category_id' });

// User - Order (One-to-Many)
db.User.hasMany(db.Order, { foreignKey: 'user_id', onDelete: 'SET NULL', onUpdate: 'CASCADE' });
db.Order.belongsTo(db.User, { foreignKey: 'user_id' });

// Order - OrderDetail (One-to-Many)
db.Order.hasMany(db.OrderDetail, { as: 'details', foreignKey: 'order_id', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
db.OrderDetail.belongsTo(db.Order, { foreignKey: 'order_id' });

// Product - OrderDetail
db.Product.hasMany(db.OrderDetail, { foreignKey: 'product_id', onDelete: 'SET NULL', onUpdate: 'CASCADE' });
db.OrderDetail.belongsTo(db.Product, { foreignKey: 'product_id' });

// Sync function (for development)
db.syncDb = async (options = {}) => {
    try {
        await sequelize.sync(options);
        logger.info(`Database synchronized successfully. Options: ${JSON.stringify(options)}`);
    } catch (error) {
        logger.error('Error synchronizing database:', error);
        throw error;
    }
};

module.exports = db;