# Chọn Node.js base image phiên bản 18-alpine (hoặc phiên bản Node.js bạn đang dùng)
FROM node:18-alpine

# Thiết lập thư mục làm việc bên trong container
WORKDIR /usr/src/app

# Sao chép package.json và package-lock.json (nếu có)
COPY package*.json ./

# Cài đặt các dependencies của dự án
# Bao gồm cả devDependencies nếu script start/build của bạn cần chúng (ví dụ: nodemon, sequelize-cli)
RUN npm install

# Sao chép toàn bộ mã nguồn của ứng dụng vào thư mục làm việc trong container
COPY . .

# Expose port mà ứng dụng của bạn lắng nghe (mặc định là 3000 theo app.js)
EXPOSE 3000

# Lệnh mặc định để khởi chạy ứng dụng khi container bắt đầu
# Nếu bạn muốn chạy ở chế độ development với nodemon, có thể đổi thành: CMD [ "npm", "run", "dev" ]
# Tuy nhiên, cho production hoặc môi trường Docker ổn định, "npm start" thường được ưu tiên.
CMD [ "npm", "start" ]