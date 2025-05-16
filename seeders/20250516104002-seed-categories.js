'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('categories', [
      { id: 6, name: 'Bàn' },
      { id: 7, name: 'Ghế' },
      { id: 8, name: 'Sofa' },
      { id: 9, name: 'Tủ kệ' },
      { id: 10, name: 'Giường' },
      { id: 11, name: 'Đồ trang trí' },
      { id: 12, name: 'a' }
      // Bảng categories trong SQL này không có description, created_at, updated_at
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('categories', null, {});
  }
};