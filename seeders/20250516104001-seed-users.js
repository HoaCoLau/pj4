'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('users', [
      {
        id: 1,
        email: 't@gmail.com',
        password: '$2b$10$3a/YOxm9f.A3BrBhlwU34ulBVoqqqZy3gpQfUsgUyCyyWhl4kCJg.',
        name: 'NGUYEN TIEN THUAN',
        image: '1746417647304-594058205.jpg',
        role: 'user'
        // Bảng users trong SQL này không có created_at, updated_at
      },
      {
        id: 2,
        email: 'b@gmail.com',
        password: '$2b$10$EjwCM0p3I5BnrdSsOxet.e2TTKZ0FdKHkXj7maLlJgdS6oXdRqbRS',
        name: 'Nguyễn Tiến Thuận',
        image: '1746429126386-840530873.jpg',
        role: 'user'
      },
      {
        id: 5,
        email: 'z@gmail.com',
        password: '$2b$10$ADG7hxOq5cgNbZ59MRrqROBGFdMCg1ovLKixbd5ZG8ELw01U51fWm',
        name: 'thuana',
        image: null, // SQL là NULL
        role: 'admin'
      },
      {
        id: 8,
        email: 'akat272001@gmail.com',
        password: '$2a$08$x8NCW6tYrdHRExa8sg32Nex5SnyeqvdaM0x.qQ2wOcIHFJiqQV5Jy',
        name: 'NGUYEN TIEN THUAN',
        image: null,
        role: 'user'
      },
      {
        id: 9,
        email: 'nguyentienthuan42@gmail.com',
        password: '$2b$10$a9TAPzFPGDXO6AJP6KQ3leCcaor9/Y.FJPntJPTe.dfJR6okP7rj2',
        name: 'Bàn Làm Việc Thông Minh Gỗ MDF2',
        image: null,
        role: 'user'
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null, {});
  }
};