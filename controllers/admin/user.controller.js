const db = require("../../models");
const User = db.users;
const Op = db.Op;
const { userUpdateSchema } = require("../../validation/user.validation.js"); // Import schema
const logger = require('../../config/logger');

// Render trang danh sách người dùng (Admin)
exports.listUsers = (req, res) => {
    req.log.info('Rendering admin user list');
    // Lấy tất cả user (không lấy mật khẩu)
    User.findAll({ attributes: { exclude: ['password'] } })
        .then(data => {
            res.render("admin/users/index", {
                title: "Quản lý Người dùng",
                users: data,
            });
        })
        .catch(err => {
            req.log.error({ err }, "Lỗi khi lấy danh sách người dùng.");
            res.status(500).render("user/errorPage", { title: "Lỗi Database", message: err.message || "Lỗi khi lấy danh sách người dùng." });
        });
};

// Render trang chi tiết người dùng (Admin)
exports.userDetail = (req, res) => {
    const id = req.params.userId;
    req.log.info(`Rendering admin user detail for ID: ${id}`);
    // Lấy user theo ID (không lấy mật khẩu), có thể include Orders, Cart nếu cần
    User.findByPk(id, { attributes: { exclude: ['password'] } /*, include: [...]*/ })
        .then(data => {
            if (data) {
                res.render("admin/users/detail", {
                    title: `Chi tiết Người dùng: ${data.name}`,
                    user_detail: data, // Đặt tên khác để tránh trùng với res.locals.user
                });
            } else {
                req.log.warn(`User not found for detail view: ${id}`);
                res.status(404).render("user/errorPage", { title: "Không tìm thấy", message: `Không tìm thấy Người dùng với id=${id}.` });
            }
        })
        .catch(err => {
            req.log.error({ err }, `Lỗi khi lấy chi tiết người dùng ${id}.`);
            res.status(500).render("user/errorPage", { title: "Lỗi Database", message: "Lỗi khi lấy chi tiết Người dùng: " + err.message });
        });
};

// Render form chỉnh sửa người dùng (Admin)
exports.editUserForm = (req, res) => {
     const id = req.params.userId;
    req.log.info(`Rendering admin user edit form for ID: ${id}`);
    // Lấy user theo ID (không lấy mật khẩu)
    User.findByPk(id, { attributes: { exclude: ['password'] } })
        .then(data => {
            if (data) {
                res.render("admin/users/edit", {
                    title: `Chỉnh sửa Người dùng: ${data.name}`,
                    user_detail: data, // Đặt tên khác để tránh trùng với res.locals.user
                });
            } else {
                 req.log.warn(`User not found for edit form: ${id}`);
                 res.status(404).render("user/errorPage", { title: "Không tìm thấy", message: `Không tìm thấy Người dùng với id=${id}.` });
            }
        })
        .catch(err => {
             req.log.error({ err }, `Lỗi khi lấy thông tin người dùng ${id} để chỉnh sửa.`);
            res.status(500).render("user/errorPage", { title: "Lỗi Database", message: "Lỗi khi lấy thông tin Người dùng để chỉnh sửa: " + err.message });
        });
};


// Xử lý cập nhật người dùng (Admin) (POST với method-override PUT)
exports.updateUserProcess = (req, res) => {
     const id = req.params.userId;
    // ** Validation sử dụng Joi **
     // Loại bỏ mật khẩu khỏi req.body nếu không có form đổi mật khẩu riêng
     const updateData = { ...req.body };
     delete updateData.password; // Không cho phép cập nhật mật khẩu qua form này

     const { error, value } = userUpdateSchema.validate(updateData, { abortEarly: false });

     if (error) {
        req.log.warn(`Validation failed for user update (${id}): ${error.details.map(x => x.message).join(', ')}`);
        return res.redirect(`/admin/users/edit/${id}?error=${error.details[0].message}`);
     }

    // Dữ liệu hợp lệ, cập nhật user
    User.update(value, { where: { id: id } })
        .then(num => {
            if (num[0] === 1) {
                req.log.info(`User updated: ${id}`);
                res.redirect("/admin/users?success=Cập nhật người dùng thành công!");
            } else {
                 req.log.warn(`User not found or no changes for update: ${id}`);
                 res.redirect(`/admin/users/edit/${id}?error=Không tìm thấy hoặc không có gì để cập nhật.`);
            }
        })
        .catch(err => {
             req.log.error({ err }, `Lỗi khi cập nhật người dùng ${id}.`);
              // Xử lý lỗi trùng email nếu database có ràng buộc UNIQUE
             // if (err.name === 'SequelizeUniqueConstraintError') {
             //     return res.redirect(`/admin/users/edit/${id}?error=Email đã tồn tại.`);
             // }
            res.redirect(`/admin/users/edit/${id}?error=${err.message || "Lỗi khi cập nhật người dùng."}`);
        });
};

// Xử lý xóa người dùng (Admin) (POST với method-override DELETE)
exports.deleteUserProcess = (req, res) => {
    const id = req.params.userId;
    req.log.info(`Attempting to delete user ID: ${id}`);
     // Lưu ý: Xóa user có thể ảnh hưởng đến các bảng orders, carts (do ràng buộc ON DELETE SET NULL/CASCADE)
    User.destroy({ where: { id: id } })
        .then(num => {
            if (num === 1) {
                req.log.info(`User deleted: ${id}`);
                res.redirect("/admin/users?success=Xóa người dùng thành công!");
            } else {
                 req.log.warn(`User not found for deletion: ${id}`);
                 res.redirect("/admin/users?error=Không tìm thấy người dùng để xóa.");
            }
        })
        .catch(err => {
             req.log.error({ err }, `Lỗi khi xóa người dùng ${id}.`);
             // Xử lý lỗi khác nếu có
            res.redirect(`/admin/users?error=${err.message || "Lỗi khi xóa người dùng."}`);
        });
};