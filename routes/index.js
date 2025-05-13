// routes/index.js
const express = require('express');
const router = express.Router();
const publicProductController = require('../controllers/public/productController'); // Có thể dùng để lấy sản phẩm nổi bật
const logger = require('../config/logger');

// GET: Trang chủ
router.get('/', async (req, res, next) => {
    try {
        // Ví dụ: Lấy một vài sản phẩm mới nhất hoặc nổi bật để hiển thị trên trang chủ
        // const featuredProducts = await Product.findAll({
        //     limit: 8,
        //     order: [['createdAt', 'DESC']],
        //     include: [{ model: Category, as: 'category', attributes: ['name'] }]
        // });
        // logger.debug('Fetched featured products for homepage.');

        res.render('home', { // Render file views/home.ejs
            pageTitle: 'Welcome to Funori Shop',
            // featuredProducts: featuredProducts,
            path: '/' // Cho active menu
        });
    } catch (error) {
        logger.error({ err: error }, 'Error rendering homepage');
        next(error);
    }
});

module.exports = router;