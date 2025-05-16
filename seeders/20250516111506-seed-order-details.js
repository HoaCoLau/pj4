'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('order_details', [
      {
        id: 1,
        order_id: 1,
        product_id: 1,
        quantity: 1,
        price_at_order: 1850000.00, // Giữ tên cột price_at_order
        product_name: 'Bàn Làm Việc Thông Minh Gỗ MDF'
        // Bảng order_details trong SQL này không có created_at, updated_at được liệt kê trong INSERT,
        // nhưng có DEFAULT CURRENT_TIMESTAMP. Sequelize sẽ tự xử lý hoặc bạn có thể thêm:
        // created_at: new Date(),
        // updated_at: new Date()
      },
      {
        id: 2,
        order_id: 2,
        product_id: 2,
        quantity: 6,
        price_at_order: 4500000.00,
        product_name: 'Bàn Ăn Tròn Mặt Đá Ceramic 4 Chỗ'
        // created_at: new Date(),
        // updated_at: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('order_details', null, {});
  }
};