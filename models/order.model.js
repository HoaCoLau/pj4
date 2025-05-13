// models/order.model.js
module.exports = (sequelize, DataTypes) => {
    const Order = sequelize.define('Order', { // Bảng `orders`
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        // user_id được tạo bởi association
        order_date: { // order_date trong SQL
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        total_amount: { // total_amount trong SQL
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
            defaultValue: 0.00
        },
        status: {
            type: DataTypes.ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'),
            allowNull: false,
            defaultValue: 'pending'
        },
        shipping_address: { // shipping_address trong SQL
            type: DataTypes.TEXT,
            allowNull: true // SQL cho phép NULL
        },
        billing_address: { // billing_address trong SQL
            type: DataTypes.TEXT,
            allowNull: true // SQL cho phép NULL
        },
        payment_method: { // payment_method trong SQL
            type: DataTypes.STRING(50),
            allowNull: true // SQL cho phép NULL
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true // SQL cho phép NULL
        }
        // updated_at được Sequelize quản lý (bảng orders có cột này)
        // createdAt: Nếu order_date là ngày tạo, có thể map createdAt: 'order_date'
        // Hoặc để Sequelize tự quản lý một cột createdAt riêng (khuyến khích)
    }, {
        tableName: 'orders',
        timestamps: true, // Bật createdAt (mới) và updatedAt (khớp SQL)
        // createdAt: 'order_date', // Nếu muốn dùng cột order_date làm createdAt
    });
    return Order;
};