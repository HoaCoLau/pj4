const db = require("../../models");
const User = db.users;
const Op = db.Op;
const { userUpdateSchema } = require("../../validation/user.validation.js");
const logger = require('../../config/logger');

// Render trang danh sách người dùng (Admin)
exports.listUsers = async (req, res) => { // Sử dụng async
    req.log.info('Rendering admin user list');
    try { // Bắt đầu try block
        const data = await User.findAll({ attributes: { exclude: ['password'] } }); // Sử dụng await
        res.render("admin/users/index", {
            title: "Quản lý Người dùng",
            users: data,
        });
    } catch (err) { // Bắt đầu catch block
        req.log.error({ err }, "Lỗi khi lấy danh sách người dùng.");
        res.status(500).render("user/errorPage", { title: "Lỗi Database", message: err.message || "Lỗi khi lấy danh sách người dùng." });
    }
};

// Render trang chi tiết người dùng (Admin)
exports.userDetail = async (req, res) => { // Sử dụng async
    const id = req.params.userId;
    req.log.info(`Rendering admin user detail for ID: ${id}`);
    try { // Bắt đầu try block
        const data = await User.findByPk(id, { attributes: { exclude: ['password'] } }); // Sử dụng await
        if (data) {
            res.render("admin/users/detail", {
                title: `Chi tiết Người dùng: ${data.name}`,
                user_detail: data,
            });
        } else {
            req.log.warn(`User not found for detail view: ${id}`);
            res.status(404).render("user/errorPage", { title: "Không tìm thấy", message: `Không tìm thấy Người dùng với id=${id}.` });
        }
    } catch (err) { // Bắt đầu catch block
        req.log.error({ err }, `Lỗi khi lấy chi tiết người dùng ${id}.`);
        res.status(500).render("user/errorPage", { title: "Lỗi Database", message: "Lỗi khi lấy chi tiết Người dùng: " + err.message });
    }
};

// Render form chỉnh sửa người dùng (Admin)
exports.editUserForm = async (req, res) => { // Sử dụng async
     const id = req.params.userId;
    req.log.info(`Rendering admin user edit form for ID: ${id}`);
    try { // Bắt đầu try block
      const data = await User.findByPk(id, { attributes: { exclude: ['password'] } }); // Sử dụng await
        if (data) {
            res.render("admin/users/edit", {
                title: `Chỉnh sửa Người dùng: ${data.name}`,
                user_detail: data,
            });
        } else {
             req.log.warn(`User not found for edit form: ${id}`);
             res.status(404).render("user/errorPage", { title: "Không tìm thấy", message: `Không tìm thấy Người dùng với id=${id}.` });
        }
    } catch (err) { // Bắt đầu catch block
         req.log.error({ err }, `Lỗi khi lấy thông tin người dùng ${id} để chỉnh sửa.`);
        res.status(500).render("user/errorPage", { title: "Lỗi Database", message: "Lỗi khi lấy thông tin Người dùng để chỉnh sửa: " + err.message });
    }
};


// Xử lý cập nhật người dùng (Admin) (POST với method-override PUT)
exports.updateUserProcess = async (req, res) => { // Sử dụng async
     const id = req.params.userId;
     const updateData = { ...req.body };
     delete updateData.password;
     delete updateData.role; // User thường không được đổi role

     const { error, value } = userUpdateSchema.validate(updateData, { abortEarly: false });

     if (error) {
        req.log.warn(`Validation failed for user update (${id}): ${error.details.map(x => x.message).join(', ')}`);
        return res.redirect(`/admin/users/edit/${id}?error=${error.details[0].message}`);
     }

    try { // Bắt đầu try block
      const num = await User.update(value, { where: { id: id } }); // Sử dụng await
        if (num[0] === 1) {
            req.log.info(`User updated: ${id}`);
            res.redirect("/admin/users?success=Cập nhật người dùng thành công!");
        } else {
             req.log.warn(`User not found or no changes for update: ${id}`);
             res.redirect(`/admin/users/edit/${id}?error=Không tìm thấy hoặc không có gì để cập nhật.`);
        }
    } catch (err) { // Bắt đầu catch block
         req.log.error({ err }, `Lỗi khi cập nhật người dùng ${id}.`);
          if (err.name === 'SequelizeUniqueConstraintError' && err.fields && err.fields.email) {
             return res.redirect(`/admin/users/edit/${id}?error=Email đã tồn tại.`);
         }
        res.redirect(`/admin/users/edit/${id}?error=${err.message || "Đã xảy ra lỗi khi cập nhật người dùng."}`);
    }
};

// Xử lý xóa người dùng (Admin) (POST với method-override DELETE)
exports.deleteUserProcess = async (req, res) => { // Sử dụng async
    const id = req.params.userId;
    req.log.info(`Attempting to delete user ID: ${id}`);
    try { // Bắt đầu try block
      const num = await User.destroy({ where: { id: id } }); // Sử dụng await
        if (num === 1) {
            logger.info(`User deleted: ${id}`);
            res.redirect("/admin/users?success=Xóa người dùng thành công!");
        } else {
             logger.warn(`User not found for deletion: ${id}`);
             res.redirect("/admin/users?error=Không tìm thấy người dùng để xóa.");
        }
    } catch (err) { // Bắt đầu catch block
         logger.error({ err }, `Lỗi khi xóa người dùng ${id}.`);
        res.redirect(`/admin/users?error=${err.message || "Đã xảy ra lỗi khi xóa người dùng."}`);
    }
};
