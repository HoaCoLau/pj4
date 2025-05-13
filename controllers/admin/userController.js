// controllers/admin/userController.js
const db = require('../../models');
const User = db.user;
const Joi = require('joi');
// const logger = require('../../config/logger');
const path = require('path');
const fs = require('fs');

// Schema validation cho cập nhật user (chỉ cho admin)
const userUpdateSchema = Joi.object({
    name: Joi.string().required().messages({'any.required': 'Tên người dùng là bắt buộc.'}),
    // Email không cho phép sửa qua form admin này để tránh phức tạp
    // role: Joi.string().valid('admin', 'user').required().messages({'any.only': 'Vai trò không hợp lệ.'}), // Có thể cho admin sửa role
     role: Joi.string().valid('admin', 'user').messages({'any.only': 'Vai trò không hợp lệ.'}), // Cho phép role không bắt buộc nếu chỉ muốn sửa tên

});


// Hiển thị danh sách người dùng (Admin)
exports.index = async (req, res) => {
    try {
        const users = await User.findAll({
             attributes: ['id', 'email', 'name', 'role', 'image'], // Chỉ lấy các trường cần thiết
             order: [['id', 'DESC']]
        });
        res.render('admin/users/index', {
            title: 'Quản lý Người dùng',
            users,
            success: req.query.success,
            error: req.query.error
        });
    } catch (err) {
        console.error('Lỗi lấy danh sách người dùng:', err);
        // logger.error(`Admin User Index Error: ${err.message}`);
        res.status(500).send('Lỗi máy chủ khi lấy danh sách người dùng.');
    }
};

// Hiển thị form sửa người dùng (Admin)
exports.edit = async (req, res) => {
     try {
         const user = await User.findByPk(req.params.id, {
              attributes: ['id', 'email', 'name', 'role', 'image'] // Chỉ lấy các trường có thể sửa
         });
         if (!user) {
              // logger.warn(`Admin User Edit Form: User ${req.params.id} not found.`);
             return res.status(404).send('Người dùng không tồn tại.');
         }
         res.render('admin/users/edit', {
             title: 'Sửa Người dùng',
             user,
             error: null,
             oldInput: user.toJSON()
         });
     } catch (err) {
         console.error('Lỗi hiển thị form sửa người dùng:', err);
         // logger.error(`Admin User Edit Form Error: ${err.message}`);
         res.status(500).send('Lỗi máy chủ khi hiển thị form sửa người dùng.');
     }
 };

// Xử lý cập nhật người dùng (Admin)
exports.update = async (req, res) => {
     // Lưu ý: Không cho phép sửa email và password qua form này
     const { error, value } = userUpdateSchema.validate(req.body, { abortEarly: false });
     const userId = req.params.id;

      // Xử lý file upload trước
     const image_url_new = req.file ? `/images/${req.file.filename}` : null;


     if (error) {
          // Xóa file ảnh đã upload nếu validation thất bại
         if (req.file && fs.existsSync(req.file.path)) {
             fs.unlinkSync(req.file.path);
         }
          const errors = error.details.map(detail => detail.message);
          const user = await User.findByPk(userId, { attributes: ['id', 'email', 'name', 'role', 'image'] });
           if (!user) { return res.status(404).send('Người dùng không tồn tại.'); }
          return res.render('admin/users/edit', {
             title: 'Sửa Người dùng',
             user,
             error: errors
          });
     }

     try {
         const user = await User.findByPk(userId);
         if (!user) {
              // Xóa file ảnh mới nếu có upload nhưng user không tồn tại
              if (req.file && fs.existsSync(req.file.path)) {
                  fs.unlinkSync(req.file.path);
              }
              // logger.warn(`Admin User Update: User ${userId} not found.`);
             return res.status(404).send('Người dùng không tồn tại.');
         }

         const { name, role } = value; // Lấy name và role từ validated value
          let final_image_url = user.image; // Giữ lại ảnh cũ mặc định

         // Xử lý upload ảnh mới
         if (image_url_new) {
             // Xóa ảnh cũ nếu có và không phải null
             if (user.image) {
                 const oldImagePath = path.join(__dirname, '../../public', user.image);
                 if (fs.existsSync(oldImagePath)) {
                     fs.unlinkSync(oldImagePath);
                      // logger.info(`Deleted old user image: ${oldImagePath}`);
                 }
             }
             final_image_url = image_url_new;
         }


         await user.update({
             name: name,
             role: role || user.role, // Chỉ cập nhật role nếu có trong request body (tùy schema validation)
             image: final_image_url
         });

         // logger.info(`Admin updated user: ${userId}`);

         res.redirect('/admin/users?success=' + encodeURIComponent('Cập nhật người dùng thành công!'));

     } catch (err) {
         console.error('Lỗi khi cập nhật người dùng:', err);
          // logger.error(`Admin User Update Error: ${err.message}`);
          // Xóa file ảnh mới nếu có lỗi xảy ra sau khi upload và xử lý
          if (req.file && fs.existsSync(req.file.path)) {
              fs.unlinkSync(req.file.path);
          }
          const user = await User.findByPk(userId, { attributes: ['id', 'email', 'name', 'role', 'image'] }); // Lấy lại dữ liệu cũ
           if (!user) { return res.status(404).send('Người dùng không tồn tại.'); }
          res.render('admin/users/edit', {
              title: 'Sửa Người dùng',
              user,
              error: ['Có lỗi xảy ra khi cập nhật người dùng. Vui lòng thử lại.']
          });
     }
 };

// Xử lý xóa người dùng (Admin)
// CÂN NHẮC KHI CHO PHÉP XÓA USER: Xóa user có thể ảnh hưởng đến các đơn hàng (order.user_id = NULL)
// và giỏ hàng (cart, cart_details bị xóa do CASCADE).
exports.delete = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
             // logger.warn(`Admin User Delete: User ${req.params.id} not found.`);
             return res.redirect('/admin/users?error=' + encodeURIComponent('Người dùng không tồn tại.'));
        }

        // Không cho phép admin tự xóa mình
        if (req.user && req.user.id === user.id) {
             // logger.warn(`Admin User Delete: Admin tried to delete themselves.`);
             return res.redirect('/admin/users?error=' + encodeURIComponent('Không thể xóa tài khoản admin đang đăng nhập.'));
        }

         // Xóa file ảnh liên quan nếu có và không phải null
         if (user.image) {
              const imagePath = path.join(__dirname, '../../public', user.image);
              if (fs.existsSync(imagePath)) {
                 fs.unlinkSync(imagePath);
                  // logger.info(`Deleted user image during deletion: ${imagePath}`);
              }
         }


        await user.destroy(); // Sequelize sẽ xử lý cascade delete cho carts và set NULL cho orders

        // logger.info(`Admin deleted user: ${req.params.id}`);

        res.redirect('/admin/users?success=' + encodeURIComponent('Xóa người dùng thành công!'));

    } catch (err) {
        console.error('Lỗi khi xóa người dùng:', err);
        // logger.error(`Admin User Delete Error: ${err.message}`);
         res.redirect('/admin/users?error=' + encodeURIComponent('Có lỗi xảy ra khi xóa người dùng.'));
    }
};