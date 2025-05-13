// models/cartDetail.model.js
module.exports = (sequelize, DataTypes) => {
    const CartDetail = sequelize.define('CartDetail', { // Bảng `cart_details`
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        // cart_id, product_id được tạo bởi associations
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
            validate: { min: 1 }
        },
        price_at_addition: { // price_at_addition trong SQL
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        added_at: { // added_at trong SQL
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW // Sequelize sẽ dùng CURRENT_TIMESTAMP
        }
    }, {
        tableName: 'cart_details',
        timestamps: false // Bảng `cart_details` không có createdAt/updatedAt, chỉ có added_at
                         // Nếu muốn Sequelize quản lý thêm createdAt/updatedAt thì đặt true và thêm cột
    });
    return CartDetail;
};