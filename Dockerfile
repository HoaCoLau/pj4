# Sử dụng image Node.js LTS chính thức làm base image
FROM node:lts-alpine

# Đặt thư mục làm việc bên trong container
WORKDIR /app

# Sao chép package.json và package-lock.json (nếu có) vào thư mục làm việc
# Sử dụng COPY thay vì ADD để tránh giải nén tarball tự động
COPY package*.json ./

# Cài đặt các dependencies của dự án
# Sử dụng --production nếu bạn chỉ muốn cài đặt các dependencies cần thiết cho môi trường production
RUN npm install

# Sao chép toàn bộ mã nguồn dự án vào thư mục làm việc
COPY . .

# Mở port mà ứng dụng Node.js lắng nghe (mặc định là 3000 trong app.js)
EXPOSE 3000

# Lệnh mặc định để chạy ứng dụng khi container khởi động
# Sử dụng npm start để chạy script start trong package.json
CMD [ "npm", "start" ]
