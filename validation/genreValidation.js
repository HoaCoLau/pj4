const Joi = require('joi');

const createGenreSchema = Joi.object({
  
  name: Joi.string().min(3).required().messages({
    'string.base': 'name must be a string',
    'string.empty': 'name is required',
    'string.min': 'name must be at least 3 characters long'
  }),

});

const updateGenreSchema = Joi.object({    
      name: Joi.string().min(3).required().messages({
        'string.base': 'name must be a string',
        'string.empty': 'name is required',
        'string.min': 'name must be at least 3 characters long'
      }),

});


module.exports = { createGenreSchema, updateGenreSchema };
