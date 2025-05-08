const Joi = require('joi');
const createOrderSchema = Joi.object({
    shipping_address: Joi.string().required().messages({ 'string.empty': 'Địa chỉ giao hàng không được để trống.', 'any.required': 'Địa chỉ giao hàng là bắt buộc.' }),
    billing_address: Joi.string().required().messages({ 'string.empty': 'Địa chỉ thanh toán không được để trống.', 'any.required': 'Địa chỉ thanh toán là bắt buộc.' }),
    payment_method: Joi.string().max(50).required().messages({ 'string.empty': 'Phương thức thanh toán không được để trống.', 'string.max': 'Phương thức thanh toán không được vượt quá 50 ký tự.', 'any.required': 'Phương thức thanh toán là bắt buộc.' }),
    notes: Joi.string().allow(null, ''),
    // total_amount và order_date thường được tính toán hoặc set tự động
    // orderDetails: Joi.array().items(Joi.object({ // Cần validate cấu trúc của orderDetails
    //     product_id: Joi.number().integer().required(),
    //     quantity: Joi.number().integer().positive().required(),
    //     price_at_order: Joi.number().positive().precision(2).required(),
    //     product_name: Joi.string().max(255).required()
    // })).min(1).required().messages({
    //     'array.min': 'Đơn hàng phải có ít nhất một sản phẩm.',
    //     'any.required': 'Chi tiết đơn hàng là bắt buộc.'
    // })
});

const updateOrderStatusSchema = Joi.object({
    status: Joi.string().valid('pending','processing','shipped','delivered','cancelled','refunded').required().messages({
        'any.only': 'Trạng thái đơn hàng không hợp lệ.',
        'any.required': 'Trạng thái đơn hàng là bắt buộc.'
    })
});

module.exports = { createOrderSchema, updateOrderStatusSchema };