'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('products', [
      {
        id: 1,
        name: 'Bàn Làm Việc Thông Minh Gỗ MDF',
        price: 1850000.00,
        category_id: 6,
        description: 'Bàn làm việc hiện đại, tích hợp ngăn kéo, gỗ MDF chống ẩm, 120x60x75cm.',
        image_url: '/images/1747276612779-products-10-1-600x600.jpg',
        stock_quantity: 25,
        created_at: new Date('2025-05-06T02:58:21.000Z'),
        updated_at: new Date('2025-05-15T02:39:20.000Z')
      },
      {
        id: 2,
        name: 'Bàn Ăn Tròn Mặt Đá Ceramic 4 Chỗ',
        price: 4500000.00,
        category_id: 6,
        description: 'Bàn ăn mặt đá ceramic vân mây, chân sắt sơn tĩnh điện, đường kính 100cm.',
        image_url: '/images/1747276612779-products-10-1-600x600.jpg',
        stock_quantity: 4,
        created_at: new Date('2025-05-06T02:58:21.000Z'),
        updated_at: new Date('2025-05-15T03:35:46.000Z')
      },
      {
        id: 3,
        name: 'Bàn Trà Sofa Gỗ Tự Nhiên',
        price: 1200000.00,
        category_id: 6,
        description: 'Bàn trà kiểu Nhật, gỗ sồi tự nhiên, thiết kế tối giản, 90x50x40cm.',
        image_url: '/images/1747276612779-products-10-1-600x600.jpg',
        stock_quantity: 35,
        created_at: new Date('2025-05-06T02:58:21.000Z'),
        updated_at: new Date('2025-05-15T02:39:49.000Z')
      },
      {
        id: 4,
        name: 'Bàn Học Sinh Có Giá Sách Gỗ Thông',
        price: 1550000.00,
        category_id: 6,
        description: 'Bàn học liền giá sách tiện lợi, gỗ thông tự nhiên, phù hợp cho trẻ em, 100x50x120cm.',
        image_url: '/images/1747276612779-products-10-1-600x600.jpg',
        stock_quantity: 28,
        created_at: new Date('2025-05-06T02:58:21.000Z'),
        updated_at: new Date('2025-05-15T02:39:51.000Z')
      },
      {
        id: 5,
        name: 'Bàn Console Trang Trí Chân Sắt',
        price: 2100000.00,
        category_id: 6,
        description: 'Bàn console áp tường, mặt gỗ óc chó, chân sắt nghệ thuật, dùng trang trí hành lang, 110x35x80cm.',
        image_url: '/images/1747276612779-products-10-1-600x600.jpg',
        stock_quantity: 18,
        created_at: new Date('2025-05-06T02:58:21.000Z'),
        updated_at: new Date('2025-05-15T02:39:55.000Z')
      },
      {
        id: 6,
        name: 'Ghế Eames Chân Gỗ Sồi',
        price: 450000.00,
        category_id: 7,
        description: 'Ghế ăn/cafe Eames nhựa PP cao cấp, chân gỗ sồi chắc chắn.',
        image_url: '/images/1747276612779-products-10-1-600x600.jpg',
        stock_quantity: 50,
        created_at: new Date('2025-05-06T02:58:21.000Z'),
        updated_at: new Date('2025-05-15T02:39:53.000Z')
      },
      {
        id: 7,
        name: 'Ghế Văn Phòng Lưng Lưới Công Thái Học',
        price: 1250000.00,
        category_id: 7,
        description: 'Ghế xoay văn phòng, lưng lưới thoáng khí, hỗ trợ cột sống, điều chỉnh độ cao.',
        image_url: '/images/1747276612779-products-10-1-600x600.jpg',
        stock_quantity: 30,
        created_at: new Date('2025-05-06T02:58:21.000Z'),
        updated_at: new Date('2025-05-15T02:39:58.000Z')
      },
      {
        id: 8,
        name: 'Ghế Đôn Tròn Bọc Vải Nhung',
        price: 380000.00,
        category_id: 7,
        description: 'Ghế đôn nhỏ gọn, bọc vải nhung mềm mại, chân kim loại mạ vàng.',
        image_url: '/images/1747276612779-products-10-1-600x600.jpg',
        stock_quantity: 40,
        created_at: new Date('2025-05-06T02:58:21.000Z'),
        updated_at: new Date('2025-05-15T02:40:02.000Z')
      },
      {
        id: 9,
        name: 'Ghế Papasan Mây Thư Giãn Đường Kính 1m',
        price: 2800000.00,
        category_id: 7,
        description: 'Ghế thư giãn Papasan khung mây tự nhiên, nệm bông dày êm ái, đường kính 100cm.',
        image_url: '/images/1747276612779-products-10-1-600x600.jpg',
        stock_quantity: 15,
        created_at: new Date('2025-05-06T02:58:21.000Z'),
        updated_at: new Date('2025-05-15T02:40:00.000Z')
      },
      {
        id: 10,
        name: 'Ghế Bar Chân Sắt Mặt Gỗ',
        price: 650000.00,
        category_id: 7,
        description: 'Ghế quầy bar chân sắt sơn tĩnh điện, mặt ngồi gỗ cao su, chiều cao mặt ngồi 75cm.',
        image_url: '/images/1747276612779-products-10-1-600x600.jpg',
        stock_quantity: 22,
        created_at: new Date('2025-05-06T02:58:21.000Z'),
        updated_at: new Date('2025-05-15T02:39:59.000Z')
      },
      {
        id: 11,
        name: 'Sofa Băng Vải Nỉ 2 Chỗ Hiện Đại',
        price: 3800000.00,
        category_id: 8,
        description: 'Sofa băng 2 chỗ ngồi, bọc vải nỉ cao cấp màu xám tro, khung gỗ dầu.',
        image_url: '/images/1747276612779-products-10-1-600x600.jpg',
        stock_quantity: 15,
        created_at: new Date('2025-05-06T02:58:21.000Z'),
        updated_at: new Date('2025-05-15T02:40:26.000Z')
      },
      {
        id: 12,
        name: 'Sofa Góc Chữ L Da Microfiber Cao Cấp',
        price: 9500000.00,
        category_id: 8,
        description: 'Sofa góc L kích thước lớn, chất liệu da microfiber chống xước, màu nâu bò.',
        image_url: '/images/1747276612779-products-10-1-600x600.jpg',
        stock_quantity: 8,
        created_at: new Date('2025-05-06T02:58:21.000Z'),
        updated_at: new Date('2025-05-15T02:40:23.000Z')
      },
      {
        id: 13,
        name: 'Sofa Armchair Đơn Vải Bố',
        price: 2600000.00,
        category_id: 8,
        description: 'Ghế sofa đơn (armchair) phong cách vintage, bọc vải bố màu kem, chân gỗ tự nhiên.',
        image_url: '/images/1747276612779-products-10-1-600x600.jpg',
        stock_quantity: 12,
        created_at: new Date('2025-05-06T02:58:21.000Z'),
        updated_at: new Date('2025-05-15T02:40:22.000Z')
      },
      {
        id: 14,
        name: 'Sofa Giường Thông Minh Gấp Gọn',
        price: 5100000.00,
        category_id: 8,
        description: 'Sofa băng có thể kéo ra thành giường ngủ tiện lợi, khung kim loại, bọc vải.',
        image_url: '/images/1747276612779-products-10-1-600x600.jpg',
        stock_quantity: 10,
        created_at: new Date('2025-05-06T02:58:21.000Z'),
        updated_at: new Date('2025-05-15T02:40:16.000Z')
      },
      {
        id: 15,
        name: 'Kệ Sách Gỗ 5 Tầng Đa Năng',
        price: 850000.00,
        category_id: 9,
        description: 'Kệ sách đứng 5 tầng, gỗ công nghiệp MDF phủ melamine, 60x30x150cm.',
        image_url: '/images/1747276612779-products-10-1-600x600.jpg',
        stock_quantity: 40,
        created_at: new Date('2025-05-06T02:58:21.000Z'),
        updated_at: new Date('2025-05-15T02:40:19.000Z')
      },
      {
        id: 16,
        name: 'Tủ Quần Áo 3 Cánh Gỗ Công Nghiệp',
        price: 2950000.00,
        category_id: 9,
        description: 'Tủ quần áo 3 cánh mở, có ngăn kéo, gỗ MDF lõi xanh chống ẩm.',
        image_url: '/images/1747276612779-products-10-1-600x600.jpg',
        stock_quantity: 12,
        created_at: new Date('2025-05-06T02:58:21.000Z'),
        updated_at: new Date('2025-05-15T02:40:13.000Z')
      },
      {
        id: 17,
        name: 'Kệ Tivi Gỗ Sồi Tự Nhiên',
        price: 2100000.00,
        category_id: 9,
        description: 'Kệ tivi phong cách Bắc Âu, gỗ sồi tự nhiên, 2 ngăn kéo, 140x40x45cm.',
        image_url: '/images/1747276612779-products-10-1-600x600.jpg',
        stock_quantity: 18,
        created_at: new Date('2025-05-06T02:58:21.000Z'),
        updated_at: new Date('2025-05-15T02:40:12.000Z')
      },
      {
        id: 18,
        name: 'Tủ Giày Thông Minh Cửa Lật',
        price: 1350000.00,
        category_id: 9,
        description: 'Tủ giày siêu mỏng tiết kiệm diện tích, cửa lật thông minh, chứa được nhiều giày dép.',
        image_url: '/images/1747276612779-products-10-1-600x600.jpg',
        stock_quantity: 33,
        created_at: new Date('2025-05-06T02:58:21.000Z'),
        updated_at: new Date('2025-05-15T02:40:11.000Z')
      },
      {
        id: 19,
        name: 'Kệ Góc Tường 4 Tầng Gỗ Tre',
        price: 550000.00,
        category_id: 9,
        description: 'Kệ trang trí góc tường 4 tầng, chất liệu tre tự nhiên, lắp ráp đơn giản.',
        image_url: '/images/1747276612779-products-10-1-600x600.jpg',
        stock_quantity: 26,
        created_at: new Date('2025-05-06T02:58:21.000Z'),
        updated_at: new Date('2025-05-15T02:40:10.000Z')
      },
      {
        id: 20,
        name: 'Tủ Rượu Gỗ Công Nghiệp Cánh Kính',
        price: 3200000.00,
        category_id: 9,
        description: 'Tủ trưng bày rượu, gỗ MDF vân gỗ óc chó, cánh kính cường lực, có đèn LED.',
        image_url: '/images/1747276612779-products-10-1-600x600.jpg',
        stock_quantity: 9,
        created_at: new Date('2025-05-06T02:58:21.000Z'),
        updated_at: new Date('2025-05-15T02:40:10.000Z')
      },
      {
        id: 21,
        name: 'Giường Ngủ Gỗ Sồi Nga 1m6x2m',
        price: 5200000.00,
        category_id: 10,
        description: 'Giường đôi gỗ sồi Nga tự nhiên, đầu giường đơn giản, vạt phản chắc chắn.',
        image_url: '/images/1747276612779-products-10-1-600x600.jpg',
        stock_quantity: 9,
        created_at: new Date('2025-05-06T02:58:21.000Z'),
        updated_at: new Date('2025-05-15T02:40:09.000Z')
      },
      {
        id: 22,
        name: 'Giường Ngủ Bọc Nệm Vải Nhung',
        price: 4800000.00,
        category_id: 10,
        description: 'Giường ngủ tân cổ điển, khung gỗ dầu, bọc nệm vải nhung xanh navy, 1m8x2m.',
        image_url: '/images/1747276612779-products-10-1-600x600.jpg',
        stock_quantity: 7,
        created_at: new Date('2025-05-06T02:58:21.000Z'),
        updated_at: new Date('2025-05-15T02:40:08.000Z')
      },
      {
        id: 23,
        name: 'Giường Tầng Trẻ Em Gỗ Thông',
        price: 3900000.00,
        category_id: 10,
        description: 'Giường 2 tầng cho bé, gỗ thông tự nhiên, có cầu thang và lan can an toàn.',
        image_url: '/images/1747276612779-products-10-1-600x600.jpg',
        stock_quantity: 11,
        created_at: new Date('2025-05-06T02:58:21.000Z'),
        updated_at: new Date('2025-05-15T02:40:07.000Z')
      },
      {
        id: 24,
        name: 'Giường Sắt Đơn Giản 1m2x2m',
        price: 1150000.00,
        category_id: 10,
        description: 'Giường đơn khung sắt sơn tĩnh điện màu đen/trắng, lắp ráp dễ dàng.',
        image_url: '/images/1747276612779-products-10-1-600x600.jpg',
        stock_quantity: 20,
        created_at: new Date('2025-05-06T02:58:21.000Z'),
        updated_at: new Date('2025-05-15T02:40:06.000Z')
      },
      {
        id: 25,
        name: 'Đèn Bàn Học LED Chống Cận',
        price: 350000.00,
        category_id: 11,
        description: 'Đèn bàn LED cảm ứng, 3 chế độ sáng, ánh sáng vàng chống cận thị.',
        image_url: '/images/1747276612779-products-10-1-600x600.jpg',
        stock_quantity: 60,
        created_at: new Date('2025-05-06T02:58:21.000Z'),
        updated_at: new Date('2025-05-15T02:40:05.000Z')
      },
      {
        id: 26,
        name: 'Tranh Treo Tường Canvas Phong Cảnh',
        price: 250000.00,
        category_id: 11,
        description: 'Bộ 3 tranh canvas in UV, khung composite, chủ đề phong cảnh biển, 40x60cm/tranh.',
        image_url: '/images/1747276612779-products-10-1-600x600.jpg',
        stock_quantity: 100,
        created_at: new Date('2025-05-06T02:58:21.000Z'),
        updated_at: new Date('2025-05-15T02:36:52.000Z')
      },
      {
        id: 27,
        name: 'Gương Treo Tường Khung Kim Loại',
        price: 750000.00,
        category_id: 11,
        description: 'Gương tròn trang trí, đường kính 60cm, khung kim loại sơn tĩnh điện.',
        image_url: '/images/1747276603161-products-17-7-600x600.jpg',
        stock_quantity: 22,
        created_at: new Date('2025-05-06T02:58:21.000Z'),
        updated_at: new Date('2025-05-15T02:36:43.000Z')
      },
      {
        id: 28,
        name: 'Thảm Trải Sàn Lông Xù Phòng Khách',
        price: 980000.00,
        category_id: 11,
        description: 'Thảm lông xù mềm mại, kích thước 1m6x2m3, màu xám ghi, đế chống trượt.',
        image_url: '/images/1747276596120-banner-33.jpg',
        stock_quantity: 19,
        created_at: new Date('2025-05-06T02:58:21.000Z'),
        updated_at: new Date('2025-05-15T02:36:36.000Z')
      },
      {
        id: 29,
        name: 'Đồng Hồ Treo Tường Nghệ Thuật',
        price: 480000.00,
        category_id: 11,
        description: 'Đồng hồ treo tường kim trôi, thiết kế hình bánh răng độc đáo, đường kính 50cm.',
        image_url: '/images/1747276587892-banner-34.jpg',
        stock_quantity: 35,
        created_at: new Date('2025-05-06T02:58:21.000Z'),
        updated_at: new Date('2025-05-15T02:36:27.000Z')
      },
      {
        id: 30,
        name: 'Bình Hoa Gốm Sứ Bát Tràng',
        price: 320000.00,
        category_id: 11,
        description: 'Bình cắm hoa gốm sứ men lam Bát Tràng, họa tiết vẽ tay, cao 30cm.',
        image_url: '/images/1747276581196-products-10-2-600x600.jpg',
        stock_quantity: 45,
        created_at: new Date('2025-05-06T02:58:21.000Z'),
        updated_at: new Date('2025-05-15T02:36:21.000Z')
      },
      {
        id: 31,
        name: 'di theo anh mat troi',
        price: 20000.00,
        category_id: 7,
        description: 'rhgefwdfghjkhgfdg',
        image_url: '/images/1747276574593-products-10-2-600x600.jpg',
        stock_quantity: 65,
        created_at: new Date('2025-05-12T07:24:59.000Z'),
        updated_at: new Date('2025-05-15T02:36:14.000Z')
      },
      {
        id: 32,
        name: 'di theo anh mat troi',
        price: 20000.00,
        category_id: 7,
        description: 'fergthyjhtgrfedwefrgthyj',
        image_url: '/images/1747276562623-ketchen-room.jpg',
        stock_quantity: 24,
        created_at: new Date('2025-05-12T07:25:15.000Z'),
        updated_at: new Date('2025-05-15T02:36:02.000Z')
      },
      {
        id: 33,
        name: 'di theo anh mat troirt3',
        price: 20000.00,
        category_id: 9,
        description: 'tgfrrtgyhujhygtyhnj',
        image_url: '/images/1747276267944-banner-6-1.jpg',
        stock_quantity: 65,
        created_at: new Date('2025-05-12T08:58:08.000Z'),
        updated_at: new Date('2025-05-15T02:31:07.000Z')
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('products', null, {});
  }
};