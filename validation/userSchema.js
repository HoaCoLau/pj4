// validation/userSchema.js
const Joi = require('joi');

// --- Schema cho Đăng ký ---
const registrationSchema = Joi.object({
    name: Joi.string()
              .trim()
              .required()
              .messages({
                  'string.empty': 'Tên không được để trống.',
                  'any.required': 'Tên là trường bắt buộc.'
              }),
    email: Joi.string()
               .email({ tlds: { allow: false } }) // Không cần check TLD phức tạp
               .required()
               .messages({
                   'string.email': 'Vui lòng nhập địa chỉ email hợp lệ.',
                   'string.empty': 'Email không được để trống.',
                   'any.required': 'Email là trường bắt buộc.'
               }),
    password: Joi.string()
                 .min(6)
                 .required()
                 .messages({
                     'string.min': 'Mật khẩu phải có ít nhất 6 ký tự.',
                     'string.empty': 'Mật khẩu không được để trống.',
                     'any.required': 'Mật khẩu là trường bắt buộc.'
                 }),
    confirmPassword: Joi.string()
                       .required()
                       .valid(Joi.ref('password')) // Phải khớp với trường password
                       .messages({
                           'any.only': 'Mật khẩu xác nhận không khớp.',
                           'string.empty': 'Xác nhận mật khẩu không được để trống.',
                           'any.required': 'Xác nhận mật khẩu là trường bắt buộc.'
                       })
});

// --- Schema cho Đăng nhập ---
const loginSchema = Joi.object({
     email: Joi.string()
                .email({ tlds: { allow: false } })
                .required()
                .messages({
                     'string.email': 'Vui lòng nhập địa chỉ email hợp lệ.',
                     'string.empty': 'Email không được để trống.',
                     'any.required': 'Email là trường bắt buộc.'
                }),
     password: Joi.string()
                 .required()
                 .messages({
                      'string.empty': 'Mật khẩu không được để trống.',
                      'any.required': 'Mật khẩu là trường bắt buộc.'
                 })
});

// --- Schema cho Cập nhật User (Admin) ---
const updateUserSchema = Joi.object({
    name: Joi.string().trim().required().messages({
        'string.empty': 'Tên không được để trống.',
        'any.required': 'Tên là trường bắt buộc.'
    }),
    email: Joi.string().email({ tlds: { allow: false } }).required().messages({
        'string.email': 'Vui lòng nhập địa chỉ email hợp lệ.',
        'string.empty': 'Email không được để trống.',
        'any.required': 'Email là trường bắt buộc.'
    }),
    role: Joi.string().valid('admin', 'user').required().messages({
        'any.only': `Vai trò phải là 'admin' hoặc 'user'.`,
        'any.required': 'Vai trò là trường bắt buộc.'
    }),
    // Không validate password ở đây vì form admin thường không cho đổi password trực tiếp
});

module.exports = {
    registrationSchema,
    loginSchema,
    updateUserSchema
};