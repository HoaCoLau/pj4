const Joi = require('joi');
const categorySchema = Joi.object({
  name: Joi.string().max(100).required().messages({ 'string.empty': 'Tên danh mục không được để trống.', 'string.max': 'Tên danh mục không được vượt quá 100 ký tự.', 'any.required': 'Tên danh mục là bắt buộc.' })
});
module.exports = categorySchema;