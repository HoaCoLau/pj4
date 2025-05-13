// controllers/admin/user.controller.js
const { User } = require('../../models');
const logger = require('../../config/logger.config');
const Joi = require('joi');

// GET: Display list of users
exports.getAllUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 15;
        const offset = (page - 1) * limit;

        const { count, rows: users } = await User.findAndCountAll({
            order: [['createdAt', 'DESC']],
            attributes: ['id', 'name', 'email', 'role', 'createdAt', 'image'], // Không lấy password
            limit: limit,
            offset: offset
        });

        res.render('admin/users/index', {
            layout: 'admin/layouts/main',
            title: 'Quản lý Người dùng',
            users: users.map(u => u.toJSON()),
            currentPage: page,
            totalPages: Math.ceil(count / limit),
        });
    } catch (error) {
        logger.error('Admin: Error fetching users:', error);
        req.flash('error_msg', 'Không thể tải danh sách người dùng.');
        res.redirect('/admin/dashboard');
    }
};

// GET: Show form to edit user role (ví dụ)
exports.showEditUserForm = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id, {
            attributes: ['id', 'name', 'email', 'role', 'image']
        });
        if (!user) {
            req.flash('error_msg', 'Người dùng không tồn tại.');
            return res.redirect('/admin/users');
        }
        res.render('admin/users/edit', {
            layout: 'admin/layouts/main',
            title: 'Sửa thông tin người dùng: ' + user.name,
            userData: user.toJSON(),
            roles: ['user', 'admin'] // Các role có thể chọn
        });
    } catch (error) {
        logger.error(`Admin: Error fetching user ID ${req.params.id} for edit:`, error);
        req.flash('error_msg', 'Lỗi tải thông tin người dùng.');
        res.redirect('/admin/users');
    }
};

// POST: Update user role
exports.updateUser = async (req, res) => {
    const userId = req.params.id;
    const { role, name } = req.body; // Chỉ cho phép sửa role và name ví dụ

    // Validation đơn giản
    if (!['user', 'admin'].includes(role)) {
        req.flash('error_msg', 'Role không hợp lệ.');
        return res.redirect(`/admin/users/edit/${userId}`);
    }
     if (!name || name.trim() === '') {
        req.flash('error_msg', 'Tên không được để trống.');
        return res.redirect(`/admin/users/edit/${userId}`);
    }


    try {
        const user = await User.findByPk(userId);
        if (!user) {
            req.flash('error_msg', 'Người dùng không tồn tại.');
            return res.redirect('/admin/users');
        }

        // Không cho admin tự đổi role của chính mình thành user (để tránh tự khóa)
        if (req.user.id === parseInt(userId) && user.role === 'admin' && role === 'user') {
             req.flash('error_msg', 'Không thể tự đổi vai trò của chính bạn từ admin thành user.');
             return res.redirect(`/admin/users/edit/${userId}`);
        }


        await user.update({ role: role, name: name });
        req.flash('success_msg', 'Thông tin người dùng đã được cập nhật.');
        res.redirect('/admin/users');
    } catch (error) {
        logger.error(`Admin: Error updating user ID ${userId}:`, error);
        req.flash('error_msg', 'Lỗi khi cập nhật người dùng.');
        res.redirect(`/admin/users/edit/${userId}`);
    }
};

// POST: Delete a user (CẨN THẬN KHI DÙNG CHỨC NĂNG NÀY)
exports.deleteUser = async (req, res) => {
    const userId = req.params.id;
    try {
        const user = await User.findByPk(userId);
        if (!user) {
            req.flash('error_msg', 'Người dùng không tồn tại.');
            return res.redirect('/admin/users');
        }

        // Ngăn admin tự xóa chính mình
        if (req.user.id === parseInt(userId)) {
            req.flash('error_msg', 'Bạn không thể tự xóa chính mình.');
            return res.redirect('/admin/users');
        }

        // Xóa các dữ liệu liên quan (orders, carts) sẽ được xử lý bởi onDelete constraints trong DB
        await user.destroy();
        req.flash('success_msg', 'Người dùng đã được xóa.');
        res.redirect('/admin/users');
    } catch (error) {
        logger.error(`Admin: Error deleting user ID ${userId}:`, error);
        req.flash('error_msg', 'Lỗi khi xóa người dùng.');
        res.redirect('/admin/users');
    }
}; 