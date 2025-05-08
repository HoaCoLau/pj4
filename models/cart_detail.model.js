module.exports = (sequelize, DataTypes) => {
    const CartDetail = sequelize.define("cart_detail", {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      cart_id: { type: DataTypes.INTEGER, allowNull: false },
      product_id: { type: DataTypes.INTEGER, allowNull: false },
      quantity: { type: DataTypes.INTEGER, defaultValue: 1, allowNull: false },
      price_at_addition: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      added_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
    }, { tableName: 'cart_details', timestamps: false });
    return CartDetail;
  };