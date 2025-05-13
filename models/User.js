// models/User.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const bcrypt = require('bcrypt');
const logger = require('../config/logger');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING, // VARCHAR(255) trong SQL
    allowNull: false,
    unique: {
      msg: 'Email already exists.'
    },
    validate: {
      isEmail: {
        msg: 'Please enter a valid email address.'
      },
    }
  },
  password: {
    type: DataTypes.STRING(100), // VARCHAR(100) trong SQL
    allowNull: false
    // Validation độ dài tối thiểu có thể thêm ở Joi hoặc ở đây
    // validate: { len: [6, 100] }
  },
  name: {
    type: DataTypes.STRING, // VARCHAR(255) trong SQL
    allowNull: false,
     validate: {
        notEmpty: { msg: 'Name cannot be empty.' }
     }
  },
  image: {
    type: DataTypes.TEXT, // TEXT trong SQL
    allowNull: true
  },
  role: {
    type: DataTypes.ENUM('admin', 'user'),
    allowNull: false,
    defaultValue: 'user'
  }
  // Sequelize sẽ tự động quản lý createdAt và updatedAt
  // vì chúng ta đã bật underscored: true trong config/db.js (nếu bạn đã thêm)
  // hoặc nếu bạn để timestamps: true (mặc định)
}, {
  tableName: 'users',
  timestamps: true, // Bật timestamps nếu muốn Sequelize quản lý
  underscored: true, // Đảm bảo map tới created_at, updated_at (nếu timestamps: true)
  hooks: {
    beforeCreate: async (user, options) => {
      if (user.password) {
        try {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
        } catch (err) {
            logger.error({ err }, 'Error hashing password before create for user %s', user.email);
            throw new Error('Error processing password.');
        }
      }
    },
    beforeUpdate: async (user, options) => {
      if (user.changed('password') && user.password) {
         try {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
         } catch (err) {
             logger.error({ err }, 'Error hashing password before update for user %s', user.email);
             throw new Error('Error processing password.');
         }
      }
    }
  }
});

// Instance method để kiểm tra password
User.prototype.isValidPassword = async function(password) {
  try {
      return await bcrypt.compare(password, this.password);
  } catch(err) {
      logger.error({ err }, 'Error comparing password for user %s', this.email);
      return false;
  }
};

module.exports = User;