const db = require("../../models");
const User = db.users;
const Joi = require('joi');
const logger = require('../../config/logger');

const userProfileUpdateSchema = Joi.object({
    name: Joi.string().max(255).required().messages({ 'string.empty': 'Tên không được để trống.', 'string.max': 'Tên không được vượt quá 255 ký tự.', 'any.required': 'Tên là bắt buộc.' }),
    image: Joi.string().uri().allow(null, '').messages({ 'string.uri': 'URL ảnh không hợp lệ.' }),
});

// Render trang xem profile của user
exports.viewProfile = (req, res) => {
    const userId = res.locals.user.id;
    req.log.info(`Rendering user profile view for user ${userId}`);
    res.render("user/profile/view", { title: "Thông tin tài khoản" });
};

// Render form chỉnh sửa profile của user
exports.editProfileForm = (req, res) => {
     const userId = res.locals.user.id;
     req.log.info(`Rendering user profile edit form for user ${userId}`);
     res.render("user/profile/edit", { title: "Chỉnh sửa thông tin tài khoản" });
};

// Xử lý submit form chỉnh sửa profile (POST với method-override PUT)
exports.updateProfileProcess = async (req, res) => { // Sử dụng async
    const userId = res.locals.user.id;
     const updateData = { ...req.body };
     delete updateData.password;
     delete updateData.role;

     const { error, value } = userProfileUpdateSchema.validate(updateData, { abortEarly: false });

     if (error) {
        req.log.warn(`Validation failed for user profile update (user ${userId}): ${error.details.map(x => x.message).join(', ')}`);
        return res.redirect(`/user/profile/edit?error=${error.details[0].message}`);
     }

    try { // Bắt đầu try block
      const num = await User.update(value, { where: { id: userId } }); // Sử dụng await
        if (num[0] === 1) {
            req.log.info(`User profile updated: ${userId}`);
            res.redirect("/user/profile?success=Cập nhật thông tin thành công!");
        } else {
             logger.warn(`User profile update resulted in no changes: ${userId}`);
             res.redirect("/user/profile/edit?error=Không có gì để cập nhật.");
        }
    } catch (err) { // Bắt đầu catch block
         logger.error({ err }, `Lỗi khi cập nhật profile user ${userId}.`);
          if (err.name === 'SequelizeUniqueConstraintError' && err.fields && err.fields.email) {
             return res.redirect(`/user/profile/edit?error=Email đã tồn tại.`);
         }
        res.redirect(`/user/profile/edit?error=${err.message || "Đã xảy ra lỗi khi cập nhật thông tin."}`);
    }
};
