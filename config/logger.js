// config/logger.js
const pino = require('pino');
const path = require('path');

const isProduction = process.env.NODE_ENV === 'production';

// Cấu hình options cho Pino
const pinoOptions = {
  level: isProduction ? 'info' : 'debug',
};

// Cấu hình transport (nơi log sẽ được ghi)
let transport;
if (!isProduction) {
  // Development: Ghi ra console với định dạng đẹp
  transport = pino.transport({
    target: 'pino-pretty',
    options: {
      colorize: true,
      levelFirst: true,
      translateTime: 'SYS:yyyy-mm-dd HH:MM:ss',
      ignore: 'pid,hostname',
    },
  });
} else {
  // Production: Ghi ra stdout dưới dạng JSON (chuẩn mực)
  // Hệ thống production (Docker, PM2, Systemd) sẽ quản lý việc ghi vào file hoặc chuyển tiếp log
   transport = pino.destination(1); // 1 = stdout


}

const logger = pino(pinoOptions, transport);

module.exports = logger;