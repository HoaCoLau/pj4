'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('cart_details', [
      {
        id: 1,
        cart_id: 1,     // Đảm bảo cart có id=1 tồn tại (từ seeder carts)
        product_id: 1,  // Đảm bảo product có id=1 tồn tại
        quantity: 1,    // Dữ liệu này không có trong SQL, tôi đặt là 1, bạn có thể sửa
        price_at_addition: 1850000.00, // Dữ liệu này không có trong SQL, tôi lấy giá product id 1, bạn có thể sửa
        added_at: new Date('2025-05-12T02:25:30.000Z') // Giả sử một thời điểm
      },
      {
        id: 2,
        cart_id: 2,     // Đảm bảo cart có id=2 tồn tại
        product_id: 2,  // Đảm bảo product có id=2 tồn tại
        quantity: 1,    // Dữ liệu này không có trong SQL, tôi đặt là 1
        price_at_addition: 4500000.00, // Dữ liệu này không có trong SQL, tôi lấy giá product id 2
        added_at: new Date('2025-05-15T01:41:45.000Z') // Giả sử một thời điểm
      }
      // Bạn có thể thêm các dòng dữ liệu khác cho cart_details ở đây nếu cần
      // Ví dụ:
      // { cart_id: 1, product_id: 2, quantity: 3, price_at_addition: 4500000.00, added_at: new Date() }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('cart_details', null, {});
  }
};