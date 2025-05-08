module.exports = (sequelize, DataTypes) => {
    const Order = sequelize.define("order", {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      user_id: { type: DataTypes.INTEGER, allowNull: true },
      order_date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      total_amount: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0.00, allowNull: false },
      status: { type: DataTypes.ENUM('pending','processing','shipped','delivered','cancelled','refunded'), defaultValue: 'pending', allowNull: false },
      shipping_address: { type: DataTypes.TEXT },
      billing_address: { type: DataTypes.TEXT },
      payment_method: { type: DataTypes.STRING(50) },
      notes: { type: DataTypes.TEXT },
      updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW, onUpdate: DataTypes.NOW }
    }, { tableName: 'orders', timestamps: false });
    return Order;
  };