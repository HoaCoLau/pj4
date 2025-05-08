const { Sequelize, DataTypes } = require('sequelize');
const dbConfig = require('../config/config.js').development;

const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
  host: dbConfig.host,
  dialect: dbConfig.dialect,
  port: dbConfig.port,
  logging: dbConfig.logging
});

sequelize.authenticate()
  .then(() => {
    console.log('Kết nối database với Sequelize thành công!');
  })
  .catch(err => {
    console.error('Không thể kết nối database:', err);
    process.exit(1);
  });

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;
db.Op = Sequelize.Op;

db.categories = require('./category.model.js')(sequelize, DataTypes);
db.products = require('./product.model.js')(sequelize, DataTypes);
db.users = require('./user.model.js')(sequelize, DataTypes);
db.orders = require('./order.model.js')(sequelize, DataTypes);
db.carts = require('./cart.model.js')(sequelize, DataTypes);
db.cartDetails = require('./cart_detail.model.js')(sequelize, DataTypes);
db.orderDetails = require('./order_detail.model.js')(sequelize, DataTypes);

db.categories.hasMany(db.products, { as: "products", foreignKey: 'category_id' });
db.products.belongsTo(db.categories, { foreignKey: "category_id", as: "category" });

db.users.hasMany(db.orders, { as: "orders", foreignKey: 'user_id' });
db.orders.belongsTo(db.users, { foreignKey: "user_id", as: "user" });

db.orders.hasMany(db.orderDetails, { as: "orderDetails", foreignKey: 'order_id' });
db.orderDetails.belongsTo(db.orders, { foreignKey: "order_id", as: "order" });

db.products.hasMany(db.orderDetails, { as: "orderDetails", foreignKey: 'product_id' });
db.orderDetails.belongsTo(db.products, { foreignKey: "product_id", as: "product", targetKey: 'id' });

db.users.hasOne(db.carts, { as: "cart", foreignKey: 'user_id' });
db.carts.belongsTo(db.users, { foreignKey: "user_id", as: "user" });

db.carts.hasMany(db.cartDetails, { as: "cartDetails", foreignKey: 'cart_id' });
db.cartDetails.belongsTo(db.carts, { foreignKey: "cart_id", as: "cart" });

db.products.hasMany(db.cartDetails, { as: "cartDetails", foreignKey: 'product_id' });
db.cartDetails.belongsTo(db.products, { foreignKey: "product_id", as: "product", targetKey: 'id' });


module.exports = db;