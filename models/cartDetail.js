// models/cartDetail.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const CartDetail = sequelize.define('CartDetail', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    cart_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'carts',
        key: 'id'
      }
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'products',
        key: 'id'
      }
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
     price_at_addition: { // Lưu giá sản phẩm tại thời điểm thêm vào giỏ
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
     added_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'cart_details',
     timestamps: false, // Dựa theo SQL file
     indexes: [
         {
             unique: true,
             fields: ['cart_id', 'product_id'] // Đảm bảo mỗi sản phẩm chỉ có một dòng trong một giỏ hàng
         }
     ]
  });

  return CartDetail;
};