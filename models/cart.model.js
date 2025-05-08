module.exports = (sequelize, DataTypes) => {
    const Cart = sequelize.define("cart", {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      user_id: { type: DataTypes.INTEGER, allowNull: false, unique: true },
      created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW, onUpdate: DataTypes.NOW }
    }, { tableName: 'carts', timestamps: false });
    return Cart;
  };