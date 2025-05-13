// controllers/admin/userController.js
const { User } = require('../../models');
const logger = require('../../config/logger');

exports.showUsersPage = async (req, res, next) => {
  try {
    const users = await User.findAll({
        attributes: ['id', 'name', 'email', 'role', 'image'], // Không lấy password
        order: [['name', 'ASC']]
    });
    res.render('admin/users/index', {
        pageTitle: 'Manage Users',
        users: users
    });
  } catch (error) {
    logger.error({ err: error }, 'Error fetching users for admin view');
    next(error);
  }
};

exports.showEditUserForm = async (req, res, next) => {
     try {
        const userId = req.params.id;
         if (isNaN(parseInt(userId)) || parseInt(userId) <= 0) { /* Validate ID */ }

        const user = await User.findByPk(userId, { attributes: { exclude: ['password'] } });
        if (!user) { /* Xử lý not found */ }

        res.render('admin/users/form', {
            pageTitle: 'Edit User Role',
            editing: true,
            userData: req.bodyInput || user.get({ plain: true }), // userData thay vì user để tránh nhầm lẫn với req.user
            errors: req.validationErrors || null
        });
    } catch (error) {
         logger.error({ err: error, userId: req.params.id }, 'Error fetching user for edit');
         next(error);
    }
};

exports.handleUpdateUser = async (req, res, next) => {
    const userId = req.params.id;
     if (isNaN(parseInt(userId)) || parseInt(userId) <= 0) { /* Validate ID */ }

    if (req.validationErrors) {
        logger.warn(`User update validation failed for ID ${userId}:`, { errors: req.validationErrors });
         try {
             const user = await User.findByPk(userId, { attributes: { exclude: ['password'] } });
              if (!user) { /* xử lý */ }
              return res.status(400).render('admin/users/form', {
                  pageTitle: 'Edit User Role',
                  editing: true,
                  userData: { id: userId, ...req.bodyInput },
                  errors: req.validationErrors
              });
         } catch(err) { return next(err); }
    }

    // Chỉ cho phép cập nhật các trường mong muốn (ví dụ: name, role)
    const { name, email, role } = req.validatedBody || req.body;

    // Ngăn admin tự hạ quyền của chính mình (ví dụ)
    if (parseInt(userId) === req.user.id && role !== 'admin') {
        logger.warn(`Admin User ID ${req.user.id} attempted to change their own role.`);
         // Redirect hoặc render lại với lỗi
         return res.status(400).render('admin/users/form', {
             pageTitle: 'Edit User Role',
             editing: true,
             userData: { id: userId, name, email, role: 'admin' }, // Giữ lại role admin
             errors: { role: 'Admin cannot remove their own admin role.' }
         });
    }

    try {
        const user = await User.findByPk(userId);
        if (!user) { /* Xử lý not found */ }

        await user.update({ name, email, role }); // Cập nhật các trường cho phép
        logger.info(`User updated by Admin ID ${req.user?.id}: Target User ID ${userId}`);
        res.redirect('/admin/users?success=true');
    } catch (error) {
         logger.error({ err: error, adminId: req.user?.id, targetUserId: userId }, 'Error updating user');
         if (error.name === 'SequelizeUniqueConstraintError') {
             // Xử lý lỗi email trùng
              try {
                 const user = await User.findByPk(userId);
                 return res.status(400).render('admin/users/form', { /* ... render với lỗi email unique ... */ });
              } catch(err) { return next(err); }
         }
        next(error);
    }
};

exports.handleDeleteUser = async (req, res, next) => {
    const userId = req.params.id;
     if (isNaN(parseInt(userId)) || parseInt(userId) <= 0) { /* Validate ID */ }

    // Ngăn admin tự xóa chính mình
    if (parseInt(userId) === req.user.id) {
        logger.warn(`Admin User ID ${req.user.id} attempted to delete themselves.`);
        return res.redirect('/admin/users?error=selfdelete');
    }

    try {
        const user = await User.findByPk(userId);
        if (!user) { /* Xử lý not found */ }

        await user.destroy();
        logger.info(`User deleted by Admin ID ${req.user?.id}: Target User ID ${userId}`);
        res.redirect('/admin/users?success=true');
    } catch (error) {
        logger.error({ err: error, adminId: req.user?.id, targetUserId: userId }, 'Error deleting user');
        // Xử lý lỗi khóa ngoại (ví dụ user còn order)
        if (error.name === 'SequelizeForeignKeyConstraintError') {
             return res.redirect('/admin/users?error=constraint');
        }
        next(error);
    }
};