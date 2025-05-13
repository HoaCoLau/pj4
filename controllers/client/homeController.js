// controllers/client/homeController.js
const db = require('../../models');
const Product = db.product;
const Category = db.category;
// const logger = require('../../config/logger');

exports.index = async (req, res) => {
  try {
    // Lấy một số sản phẩm nổi bật hoặc sản phẩm mới nhất
    const latestProducts = await Product.findAll({
      where: { stock_quantity: { [db.Sequelize.Op.gt]: 0 } }, // Chỉ lấy sản phẩm còn hàng
      order: [['created_at', 'DESC']],
      limit: 8 // Lấy 8 sản phẩm mới nhất
    });
    const categories = await Category.findAll(); // Lấy danh sách danh mục cho menu (nếu cần hiển thị ở header/footer)

    res.render('client/home', {
        title: 'Trang chủ',
        latestProducts,
        categories,
        // res.locals.user đã có nhờ middleware attachUserToLocals
    });
  } catch (err) {
    console.error('Lỗi lấy dữ liệu trang chủ:', err);
    // logger.error(`Client Home Error: ${err.message}`);
    res.status(500).send('Lỗi máy chủ khi tải trang chủ.');
  }
};