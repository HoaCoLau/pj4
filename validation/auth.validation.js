const Joi = require('joi');
const signupSchema = Joi.object({
    name: Joi.string().max(255).required().messages({ 'string.empty': 'Tên không được để trống.', 'string.max': 'Tên không được vượt quá 255 ký tự.', 'any.required': 'Tên là bắt buộc.' }),
    email: Joi.string().email().max(255).required().messages({ 'string.empty': 'Email không được để trống.', 'string.email': 'Email không hợp lệ.', 'string.max': 'Email không được vượt quá 255 ký tự.', 'any.required': 'Email là bắt buộc.' }),
    password: Joi.string().min(6).required().messages({ 'string.empty': 'Mật khẩu không được để trống.', 'string.min': 'Mật khẩu phải có ít nhất {#limit} ký tự.', 'any.required': 'Mật khẩu là bắt buộc.' }),
    role: Joi.string().valid('admin', 'user').default('user').messages({ 'any.only': 'Vai trò không hợp lệ.' })
});
const signinSchema = Joi.object({
    email: Joi.string().email().max(255).required().messages({ 'string.empty': 'Email không được để trống.', 'string.email': 'Email không hợp lệ.', 'string.max': 'Email không được vượt quá 255 ký tự.', 'any.required': 'Email là bắt buộc.' }),
    password: Joi.string().required().messages({ 'string.empty': 'Mật khẩu không được để trống.', 'any.required': 'Mật khẩu là bắt buộc.' })
});
module.exports = { signupSchema, signinSchema };