const Joi = require('joi');

const createBookSchema = Joi.object({
  title: Joi.string().min(3).required().messages({
    'string.base': 'Title must be a string',
    'string.empty': 'Title is required',
    'string.min': 'Title must be at least 3 characters long'
  }),

  price: Joi.number().greater(0).required().messages({
    'number.base': 'Price must be a number',
    'number.greater': 'Price must be a positive number',
    'any.required': 'Price is required'
  }),

  genre_id: Joi.number().integer().required().messages({
    'number.base': 'Genre ID must be a number',
    'any.required': 'Genre is required'
  }),
  decription: Joi.string().min(10).required().messages({
    'string.base': 'Decription must be a string',
    'string.empty': 'Decription is required',
    'string.min': 'Decription must be at least 10 characters long'
  })
});

const updateBookSchema = Joi.object({
    title: Joi.string().min(3).required().messages({
        'string.base': 'Title must be a string',
        'string.empty': 'Title is required',
        'string.min': 'Title must be at least 3 characters long'
      }),
    
      price: Joi.number().greater(0).required().messages({
        'number.base': 'Price must be a number',
        'number.greater': 'Price must be a positive number',
        'any.required': 'Price is required'
      }),
    
      genre_id: Joi.number().integer().required().messages({
        'number.base': 'Genre ID must be a number',
        'any.required': 'Genre is required'
      }),
      decription: Joi.string().min(10).required().messages({
        'string.base': 'Decription must be a string',
        'string.empty': 'Decription is required',
        'string.min': 'Decription must be at least 10 characters long'
      })
});


module.exports = { createBookSchema, updateBookSchema };
