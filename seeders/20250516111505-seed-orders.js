'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('orders', [
      {
        id: 1,
        user_id: 5,
        order_date: new Date('2025-05-12T02:25:11.000Z'),
        total_amount: 1850000.00,
        status: 'pending',
        shipping_address: 'egeagggggggggggggw',
        billing_address: 'gưeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', // Giữ nguyên ký tự đặc biệt nếu có
        payment_method: 'cod',
        notes: 'hgfdsdfgh',
        updated_at: new Date('2025-05-12T02:25:11.000Z')
        // Bảng orders trong SQL này không có created_at được liệt kê trong INSERT,
        // nhưng có DEFAULT CURRENT_TIMESTAMP. Sequelize sẽ tự xử lý hoặc có thể thêm:
        // created_at: new Date('2025-05-12T02:25:11.000Z'), // nếu muốn giống order_date
      },
      {
        id: 2,
        user_id: 5,
        order_date: new Date('2025-05-15T03:35:46.000Z'),
        total_amount: 27000000.00,
        status: 'refunded',
        shipping_address: 'kjmhngbfvdcsdfhgjyukhikjhgfdswfegrhjj',
        billing_address: 'hgfdcfgthfyjukijhgfdghjk,.l',
        payment_method: 'cod',
        notes: 'lkjhgfdwertyujk',
        updated_at: new Date('2025-05-15T08:28:08.000Z')
        // created_at: new Date('2025-05-15T03:35:46.000Z'),
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('orders', null, {});
  }
};