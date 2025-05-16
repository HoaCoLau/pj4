'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('carts', [
      {
        id: 1,
        user_id: 5,
        created_at: new Date('2025-05-12T02:24:52.000Z'),
        updated_at: new Date('2025-05-12T02:24:52.000Z')
      },
      {
        id: 2,
        user_id: 9,
        created_at: new Date('2025-05-15T01:41:37.000Z'),
        updated_at: new Date('2025-05-15T01:41:37.000Z')
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('carts', null, {});
  }
};