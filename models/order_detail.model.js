module.exports = (sequelize, DataTypes) => {
    const OrderDetail = sequelize.define("order_detail", {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      order_id: { type: DataTypes.INTEGER, allowNull: false },
      product_id: { type: DataTypes.INTEGER, allowNull: true },
      quantity: { type: DataTypes.INTEGER, defaultValue: 1, allowNull: false },
      price_at_order: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      product_name: { type: DataTypes.STRING(255), allowNull: false }
    }, { tableName: 'order_details', timestamps: false });
    return OrderDetail;
  };