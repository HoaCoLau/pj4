// validation/productSchema.js
const Joi = require('joi');

const productSchema = Joi.object({
    name: Joi.string().trim().min(3).required().messages({
        'string.empty': 'Tên sản phẩm không được để trống.',
        'string.min': 'Tên sản phẩm phải có ít nhất 3 ký tự.',
        'any.required': 'Tên sản phẩm là trường bắt buộc.'
    }),
    price: Joi.number().positive().required().messages({
        'number.base': 'Giá phải là một số.',
        'number.positive': 'Giá phải là số dương.',
        'any.required': 'Giá là trường bắt buộc.'
    }),
    categoryId: Joi.number().integer().positive().required().messages({
        'number.base': 'ID Danh mục phải là số.',
        'number.integer': 'ID Danh mục phải là số nguyên.',
        'number.positive': 'ID Danh mục phải là số nguyên dương.',
        'any.required': 'Danh mục là trường bắt buộc.'
    }),
    description: Joi.string().trim().allow('', null), // Cho phép rỗng hoặc null
    stockQuantity: Joi.number().integer().min(0).allow(null).default(0).messages({
        'number.base': 'Số lượng tồn kho phải là số.',
        'number.integer': 'Số lượng tồn kho phải là số nguyên.',
        'number.min': 'Số lượng tồn kho không được âm.'
    }),
    // Không validate image ở đây, Multer sẽ xử lý loại file/kích thước
    // imageUrl: Joi.string().allow(null, ''), // Có thể thêm nếu bạn validate cả trường này
});//.options({ stripUnknown: true }); // Không nên dùng stripUnknown nếu dùng form data

module.exports = productSchema;