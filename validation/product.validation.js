const Joi = require('joi');
const productSchema = Joi.object({
  name: Joi.string().max(255).required().messages({ 'string.empty': 'Tên sản phẩm không được để trống.', 'string.max': 'Tên sản phẩm không được vượt quá 255 ký tự.', 'any.required': 'Tên sản phẩm là bắt buộc.' }),
  price: Joi.number().positive().precision(2).required().messages({ 'number.base': 'Giá sản phẩm phải là số.', 'number.positive': 'Giá sản phẩm phải là số dương.', 'number.precision': 'Giá sản phẩm tối đa 2 chữ số thập phân.', 'any.required': 'Giá sản phẩm là bắt buộc.' }),
  category_id: Joi.number().integer().allow(null).messages({ 'number.base': 'ID danh mục phải là số nguyên.', 'number.integer': 'ID danh mục phải là số nguyên.' }),
  description: Joi.string().allow(null, '').messages({ 'string.base': 'Mô tả phải là chuỗi.' }),
  image_url: Joi.string().uri().allow(null, '').messages({ 'string.uri': 'URL ảnh không hợp lệ.' }),
  stock_quantity: Joi.number().integer().min(0).default(0).messages({ 'number.base': 'Số lượng tồn kho phải là số nguyên.', 'number.integer': 'Số lượng tồn kho phải là số nguyên.', 'number.min': 'Số lượng tồn kho không được âm.' })
});
module.exports = productSchema;