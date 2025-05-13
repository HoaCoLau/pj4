// middleware/uploadMiddleware.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const logger = require('../config/logger');

// Thư mục lưu ảnh upload
const uploadDir = path.join(__dirname, '../public/uploads/images');

// Đảm bảo thư mục uploads tồn tại
try {
    if (!fs.existsSync(uploadDir)){
        fs.mkdirSync(uploadDir, { recursive: true });
        logger.info(`Upload directory created: ${uploadDir}`);
    }
} catch (err) {
    logger.error({ err }, `Could not create upload directory: ${uploadDir}`);
    // Có thể ném lỗi ở đây để dừng ứng dụng nếu thư mục upload là bắt buộc
}


// Cấu hình lưu trữ file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Tạo tên file duy nhất: timestamp-ten_file_goc_khong_dau_cach.extension
    const timestamp = Date.now();
    const originalname = Buffer.from(file.originalname, 'latin1').toString('utf8'); // Xử lý tên file tiếng Việt
    const filename = originalname.toLowerCase().replace(/[^a-z0-9.]+/g, '_'); // Thay ký tự đặc biệt, khoảng trắng
    const uniqueFilename = `${timestamp}-${filename}`;
    cb(null, uniqueFilename);
  }
});

// Kiểm tra loại file (chỉ chấp nhận ảnh)
const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true); // Chấp nhận file
  } else {
     logger.warn(`Upload rejected: Invalid file type - ${file.mimetype}`);
     // Tạo lỗi để middleware xử lý lỗi hoặc controller bắt
     const err = new Error('Invalid file type. Only JPG, PNG, GIF, WEBP images are allowed.');
     err.statusCode = 400; // Bad request
     cb(err, false); // Từ chối file
  }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // Giới hạn 5MB
    }
// Bắt lỗi từ Multer (ví dụ file quá lớn)
}).single('image'); // 'image' là giá trị thuộc tính 'name' của <input type="file">

// Middleware wrapper để bắt lỗi Multer và chuyển cho next()
const handleUpload = (req, res, next) => {
    upload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            // Lỗi từ Multer (ví dụ: file quá lớn - err.code === 'LIMIT_FILE_SIZE')
             logger.warn({ err }, 'Multer error during upload');
             const error = new Error(`File upload error: ${err.message}`);
             error.statusCode = 400;
             return next(error);
        } else if (err) {
            // Lỗi khác (ví dụ: lỗi từ fileFilter)
            logger.warn({ err }, 'Non-Multer error during upload');
            return next(err); // Chuyển lỗi đã được tạo (ví dụ: lỗi sai định dạng file)
        }
        // Mọi thứ ổn, không có lỗi upload -> tiếp tục
        next();
    });
};


module.exports = handleUpload; // Export middleware đã xử lý lỗi