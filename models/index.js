// models/index.js
const { Sequelize, DataTypes } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: process.env.DB_DIALECT,
  logging: false, // Đặt true để thấy các câu lệnh SQL được thực thi
  timezone: '+07:00', // Đảm bảo múi giờ phù hợp
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import các model
db.user = require('./user')(sequelize, DataTypes);
db.category = require('./category')(sequelize, DataTypes);
db.product = require('./product')(sequelize, DataTypes);
db.order = require('./order')(sequelize, DataTypes);
db.orderDetail = require('./orderDetail')(sequelize, DataTypes);
db.cart = require('./cart')(sequelize, DataTypes);
db.cartDetail = require('./cartDetail')(sequelize, DataTypes);

// Định nghĩa các mối quan hệ (Associations) dựa trên pj4.sql

// User và Order (Một User có nhiều Order)
db.user.hasMany(db.order, { foreignKey: 'user_id' });
db.order.belongsTo(db.user, { foreignKey: 'user_id' });

// Category và Product (Một Category có nhiều Product)
db.category.hasMany(db.product, { foreignKey: 'category_id' });
db.product.belongsTo(db.category, { foreignKey: 'category_id' });

// Order và OrderDetail (Một Order có nhiều OrderDetail)
db.order.hasMany(db.orderDetail, { foreignKey: 'order_id' });
db.orderDetail.belongsTo(db.order, { foreignKey: 'order_id' });

// OrderDetail và Product (Một OrderDetail liên kết với một Product, có thể null nếu sản phẩm bị xóa)
db.product.hasMany(db.orderDetail, { foreignKey: 'product_id' });
db.orderDetail.belongsTo(db.product, { foreignKey: 'product_id' });

// User và Cart (Một User có một Cart duy nhất)
db.user.hasOne(db.cart, { foreignKey: 'user_id', onDelete: 'CASCADE' });
db.cart.belongsTo(db.user, { foreignKey: 'user_id' });

// Cart và CartDetail (Một Cart có nhiều CartDetail)
db.cart.hasMany(db.cartDetail, { foreignKey: 'cart_id', onDelete: 'CASCADE' });
db.cartDetail.belongsTo(db.cart, { foreignKey: 'cart_id' });

// CartDetail và Product (Một CartDetail liên kết với một Product)
db.product.hasMany(db.cartDetail, { foreignKey: 'product_id' });
db.cartDetail.belongsTo(db.product, { foreignKey: 'product_id' });


// Đồng bộ model với database (Chỉ chạy lần đầu hoặc khi có thay đổi schema lớn - cẩn thận với dữ liệu hiện có)
// db.sequelize.sync({ force: true }) // force: true sẽ xóa bảng cũ và tạo lại
//   .then(() => {
//     console.log('Database & tables created!');
//   })
//   .catch(err => console.log(err));

module.exports = db;