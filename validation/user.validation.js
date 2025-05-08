const Joi = require('joi');
const userUpdateSchema = Joi.object({
    email: Joi.string().email().max(255).required().messages({ 'string.empty': 'Email không được để trống.', 'string.email': 'Email không hợp lệ.', 'string.max': 'Email không được vượt quá 255 ký tự.', 'any.required': 'Email là bắt buộc.' }),
    name: Joi.string().max(255).required().messages({ 'string.empty': 'Tên không được để trống.', 'string.max': 'Tên không được vượt quá 255 ký tự.', 'any.required': 'Tên là bắt buộc.' }),
    image: Joi.string().uri().allow(null, '').messages({ 'string.uri': 'URL ảnh không hợp lệ.' }),
    role: Joi.string().valid('admin', 'user').required().messages({ 'any.only': 'Vai trò không hợp lệ.', 'any.required': 'Vai trò là bắt buộc.' })

});
module.exports = { userUpdateSchema };