// models/orderDetail.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const OrderDetail = sequelize.define('OrderDetail', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    order_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'orders',
        key: 'id'
      }
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: true, // Dựa theo SQL file có thể NULL
      references: {
        model: 'products',
        key: 'id'
      }
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    price_at_order: { // Giá sản phẩm tại thời điểm đặt hàng
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
     product_name: { // Lưu lại tên sản phẩm tại thời điểm đặt hàng (để hiển thị nếu sản phẩm gốc bị xóa)
      type: DataTypes.STRING(255),
      allowNull: false
    }
  }, {
    tableName: 'order_details',
    timestamps: false // Dựa theo SQL file
  });

  return OrderDetail;
};