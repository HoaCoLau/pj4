// models/cart.model.js
module.exports = (sequelize, DataTypes) => {
    const Cart = sequelize.define('Cart', { // Bảng `carts`
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        }
        // user_id được tạo bởi association
        // createdAt, updatedAt được Sequelize quản lý (bảng carts có các cột này trong SQL)
    }, {
        tableName: 'carts',
        timestamps: true // Khớp với SQL
    });
    return Cart;
};