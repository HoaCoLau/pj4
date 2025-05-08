const Joi = require('joi');

const addItemSchema = Joi.object({
    product_id: Joi.number().integer().positive().required().messages({
        'number.base': 'ID sản phẩm phải là số nguyên.',
        'number.integer': 'ID sản phẩm phải là số nguyên.',
        'number.positive': 'ID sản phẩm phải là số dương.',
        'any.required': 'ID sản phẩm là bắt buộc.'
    }),
    quantity: Joi.number().integer().min(1).default(1).messages({
        'number.base': 'Số lượng phải là số nguyên.',
        'number.integer': 'Số lượng phải là số nguyên.',
        'number.min': 'Số lượng phải tối thiểu là {#limit}.'
    })
});

const updateItemSchema = Joi.object({
    quantity: Joi.number().integer().min(0).required().messages({ // Cho phép 0 để xóa item
        'number.base': 'Số lượng phải là số nguyên.',
        'number.integer': 'Số lượng phải là số nguyên.',
        'number.min': 'Số lượng không được âm.'
    })
});

module.exports = { addItemSchema, updateItemSchema };