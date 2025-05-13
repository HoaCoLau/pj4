// models/user.model.js
const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', { // Sequelize sẽ tạo bảng `users`
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: {
                name: 'email', // Tên constraint unique nếu cần
                msg: 'Email đã được sử dụng.' // Thông báo lỗi nếu trùng
            },
            validate: {
                isEmail: {
                    msg: "Định dạng email không hợp lệ."
                }
            }
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        image: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        role: {
            type: DataTypes.ENUM('admin', 'user'),
            allowNull: false,
            defaultValue: 'user'
        }
        // createdAt, updatedAt được Sequelize tự động quản lý (do `timestamps: true` trong define của sequelize.config)
    }, {
        tableName: 'users', // Chỉ định rõ tên bảng
        timestamps: true, // Bật timestamps cho model này (ghi đè config chung nếu cần)
        hooks: {
            beforeCreate: async (user) => {
                if (user.password) {
                    const salt = await bcrypt.genSalt(10);
                    user.password = await bcrypt.hash(user.password, salt);
                }
            },
            beforeUpdate: async (user) => {
                if (user.changed('password') && user.password) {
                    const salt = await bcrypt.genSalt(10);
                    user.password = await bcrypt.hash(user.password, salt);
                }
            }
        }
    });

    User.prototype.isValidPassword = async function(password) {
        return bcrypt.compare(password, this.password);
    };

    return User;
};