// validation/categorySchema.js
const Joi = require('joi');

const categorySchema = Joi.object({
    name: Joi.string()
             .trim()
             .min(2)
             .required()
             .messages({
                 'string.base': `Tên danh mục phải là chữ`,
                 'string.empty': `Tên danh mục không được để trống`,
                 'string.min': `Tên danh mục phải có ít nhất {#limit} ký tự`,
                 'any.required': `Tên danh mục là trường bắt buộc`
             }),
});

module.exports = categorySchema;