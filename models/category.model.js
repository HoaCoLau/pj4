// models/category.model.js
module.exports = (sequelize, DataTypes) => {
    const Category = sequelize.define('Category', { // Bảng `categories`
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: {
                name: 'name',
                msg: 'Tên danh mục đã tồn tại.'
            }
        }
    }, {
        tableName: 'categories',
        timestamps: false // Bảng `categories` trong SQL gốc không có timestamps
    });
    return Category;
};