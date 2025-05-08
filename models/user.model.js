module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define("user", {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      email: { type: DataTypes.STRING(255), allowNull: false, unique: true },
      password: { type: DataTypes.STRING(100), allowNull: false },
      name: { type: DataTypes.STRING(255), allowNull: false },
      image: { type: DataTypes.TEXT },
      role: { type: DataTypes.ENUM('admin', 'user'), defaultValue: 'user', allowNull: false }
    }, { tableName: 'users', timestamps: false });
    return User;
  };