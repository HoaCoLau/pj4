# Sử dụng image Node.js LTS chính thức làm base image
FROM node:lts-alpine

# Cài đặt mysql-client để sử dụng lệnh mysql
RUN apk add --no-cache mysql-client

# Đặt thư mục làm việc bên trong container
WORKDIR /app

# Sao chép package.json và package-lock.json (nếu có) vào thư mục làm việc
COPY package*.json ./

# Cài đặt các dependencies của dự án
RUN npm install

# Sao chép toàn bộ mã nguồn dự án vào thư mục làm việc
COPY . .

# Sao chép script wait-for-db.sh vào thư mục /usr/local/bin/
COPY wait-for-db.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/wait-for-db.sh

# Mở port mà ứng dụng Node.js lắng nghe
EXPOSE 3000

# Lệnh mặc định để chạy ứng dụng khi container khởi động
CMD ["npm", "start"]
