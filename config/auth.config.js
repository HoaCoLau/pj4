// config/auth.config.js
require('dotenv').config();

module.exports = {
  secret: process.env.JWT_SECRET || 'thay_the_bang_mot_chuoi_bi_mat_dai_hon_va_manh_me_hon',
  expiresIn: process.env.JWT_EXPIRES_IN || '5h'
};