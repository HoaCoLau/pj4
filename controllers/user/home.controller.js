// controllers/user/home.controller.js
const { Product } = require('../../models'); // Import từ models/index.js
const logger = require('../../config/logger.config');

exports.getHomePage = async (req, res) => {
    try {
        const latestProducts = await Product.findAll({
            limit: 8, // Số sản phẩm hiển thị
            order: [['createdAt', 'DESC']],
            attributes: ['id', 'name', 'price', 'image_url', 'stock_quantity'] // Lấy thêm stock_quantity
        });

        res.render('user/home', {
            title: 'Trang chủ',
            featuredProducts: latestProducts.map(p => p.toJSON()) // Chuyển sang plain objects
        });
    } catch (error) {
        logger.error('Error fetching products for home page (Sequelize):', error);
        res.status(500).render('user/error', {
            title: 'Lỗi Server',
            message: 'Không thể tải trang chủ. Vui lòng thử lại sau.'
        });
    }
};