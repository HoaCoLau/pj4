// middleware/validationMiddleware.js
const logger = require('../config/logger');

const validate = (schema, dataLocation = 'body') => { // Thêm dataLocation để validate params, query
  return (req, res, next) => {
    let dataToValidate;
    switch(dataLocation) {
        case 'params':
            dataToValidate = req.params;
            break;
        case 'query':
            dataToValidate = req.query;
            break;
        default: // 'body'
            dataToValidate = req.body;
    }

    const { error, value } = schema.validate(dataToValidate, {
        abortEarly: false, // Thu thập tất cả lỗi
        stripUnknown: true, // Bỏ qua các trường không có trong schema
        errors: {
           wrap: { label: false } // Không muốn label là tên trường trong message lỗi (ví dụ: thay vì '"name" is required' chỉ còn 'Name is required') - tùy chọn
        }
    });

    if (error) {
      // Định dạng lại lỗi cho dễ dùng trong EJS
      const validationErrors = error.details.reduce((acc, currentError) => {
         const key = currentError.path.join('.') || 'general'; // Lấy tên trường, dùng 'general' nếu không rõ path
         acc[key] = currentError.message;
         return acc;
       }, {});

      logger.warn(`Validation Error (${dataLocation}):`, { errors: validationErrors, input: dataToValidate, url: req.originalUrl });

      // Gắn lỗi và dữ liệu gốc vào req để controller xử lý (render lại form)
      req.validationErrors = validationErrors;
      req.bodyInput = dataToValidate; // Lưu lại input gốc

      // Không chặn request, để controller quyết định
      return next();
    }

    // Gán dữ liệu đã validate vào một thuộc tính riêng của req
    // để controller có thể sử dụng dữ liệu sạch
    if (dataLocation === 'body') req.validatedBody = value;
    if (dataLocation === 'params') req.validatedParams = value;
    if (dataLocation === 'query') req.validatedQuery = value;

    next(); // Validation thành công
  };
};

module.exports = validate;