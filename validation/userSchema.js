// validation/userSchema.js
const Joi = require('joi');

// ... (registrationSchema đã có) ...

const updateUserSchema = Joi.object({
    name: Joi.string().trim().required().messages({ /*...*/ }),
    email: Joi.string().email({ tlds: { allow: false } }).required().messages({ /*...*/ }),
    role: Joi.string().valid('admin', 'user').required().messages({
        'any.only': `Role must be either 'admin' or 'user'.`,
        'any.required': 'Role is required.'
    }),
    // Không cho phép cập nhật password qua form này chẳng hạn
});

module.exports = { registrationSchema, /*loginSchema,*/ updateUserSchema };