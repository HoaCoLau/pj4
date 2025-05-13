// server.js
const app = require('./app'); // Import Express app đã cấu hình
const logger = require('./config/logger.config');
// dotenv đã được gọi trong app.js và các file config, không cần gọi lại ở đây trừ khi có biến môi trường server.js cần.

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}. Mode: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`Access it at: http://localhost:${PORT}`);
});