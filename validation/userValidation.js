const Joi = require('joi');

const createUserSchema = Joi.object({
  email: Joi.string().min(3).required().messages({
    'string.base': 'email must be a string',
    'string.empty': 'email is required',
    'string.min': 'email must be at least 3 characters long'
  }),
  
  name: Joi.string().min(3).required().messages({
    'string.base': 'name must be a string',
    'string.empty': 'name is required',
    'string.min': 'name must be at least 3 characters long'
  }),

  password: Joi.string().min(6).required().messages({
    'string.base': 'password must be a string',
    'string.empty': 'password is required',
    'string.min': 'password must be at least 6 characters long'
  }),

});

const updateUserSchema = Joi.object({
    email: Joi.string().min(3).required().messages({
        'string.base': 'email must be a string',
        'string.empty': 'email is required',
        'string.min': 'email must be at least 3 characters long'
      }),
      
      name: Joi.string().min(3).required().messages({
        'string.base': 'name must be a string',
        'string.empty': 'name is required',
        'string.min': 'name must be at least 3 characters long'
      }),
    
      password: Joi.string().min(6).required().messages({
        'string.base': 'password must be a string',
        'string.empty': 'password is required',
        'string.min': 'password must be at least 6 characters long'
      }),
    
});


module.exports = { createUserSchema, updateUserSchema };
