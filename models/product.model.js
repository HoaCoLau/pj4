module.exports = (sequelize, DataTypes) => {
    const Product = sequelize.define("product", {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: DataTypes.STRING(255), allowNull: false },
      price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      category_id: { type: DataTypes.INTEGER, allowNull: true },
      description: { type: DataTypes.TEXT },
      image_url: { type: DataTypes.TEXT },
      stock_quantity: { type: DataTypes.INTEGER, defaultValue: 0 },
      created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW, onUpdate: DataTypes.NOW }
    }, { tableName: 'products', timestamps: false });
    return Product;
  };