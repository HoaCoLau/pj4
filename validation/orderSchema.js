// validation/orderSchema.js
const Joi = require('joi');

const updateOrderStatusSchema = Joi.object({
    status: Joi.string()
                .valid('pending','processing','shipped','delivered','cancelled','refunded')
                .required()
                .messages({
                    'any.only': `Status must be one of the allowed values.`,
                    'any.required': 'Status is required.'
                })
});

module.exports = { updateOrderStatusSchema };