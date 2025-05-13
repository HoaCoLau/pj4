// models/orderDetail.model.js
module.exports = (sequelize, DataTypes) => {
    const OrderDetail = sequelize.define('OrderDetail', { // Bảng `order_details`
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        // order_id, product_id được tạo bởi associations
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        price_at_order: { // price_at_order trong SQL
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        product_name: { // product_name trong SQL
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        tableName: 'order_details',
        timestamps: false // Bảng `order_details` trong SQL không có timestamps
    });
    return OrderDetail;
};