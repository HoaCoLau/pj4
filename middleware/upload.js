
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const logger = require('../config/logger');

const uploadDir = path.join(__dirname, '../public/images');

if (!fs.existsSync(uploadDir)) {
    try {
        fs.mkdirSync(uploadDir, { recursive: true });
        logger.info(`Upload directory created: ${uploadDir}`);
    } catch (err) {
        logger.error({ err }, `Failed to create upload directory: ${uploadDir}`);

    }
} else {
    logger.debug(`Upload directory already exists: ${uploadDir}`);
}


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); 
  },
  filename: (req, file, cb) => {
    const safeOriginalname = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_');
    cb(null, Date.now() + '-' + safeOriginalname);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true); 
  } else {
    cb(new Error('Chỉ cho phép tải lên file ảnh!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 1024 * 1024 * 6 } 
});

const uploadProductImage = upload.single('image');

module.exports = {
    uploadProductImage,
    uploadDir 
};
