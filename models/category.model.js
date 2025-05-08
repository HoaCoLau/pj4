module.exports = (sequelize, DataTypes) => {
    const Category = sequelize.define("category", {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: DataTypes.STRING(100), allowNull: false }
    }, { tableName: 'categories', timestamps: false });
    return Category;
  };