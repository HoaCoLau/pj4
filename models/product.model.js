// models/product.model.js
module.exports = (sequelize, DataTypes) => {
    const Product = sequelize.define('Product', { // Bảng `products`
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            validate: {
                isDecimal: true,
                min: 0
            }
        },
        // category_id được tạo bởi association Product.belongsTo(Category)
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        image_url: { // image_url trong SQL
            type: DataTypes.TEXT,
            allowNull: true
        },
        stock_quantity: { // stock_quantity trong SQL
            type: DataTypes.INTEGER,
            allowNull: true, // SQL cho phép NULL
            defaultValue: 0,
            validate: {
                min: 0
            }
        }
        // createdAt, updatedAt được Sequelize quản lý (bảng products có các cột này trong SQL)
    }, {
        tableName: 'products',
        timestamps: true // Khớp với SQL (có created_at, updated_at)
    });
    return Product;
};