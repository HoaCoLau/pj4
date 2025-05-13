// controllers/client/productController.js
const db = require('../../models');
const Product = db.product;
const Category = db.category;
// const logger = require('../../config/logger');
const { Op } = require('sequelize');

// Hiển thị danh sách sản phẩm (Client)
exports.index = async (req, res) => {
    try {
        const categoryId = req.query.category; // Lấy category ID từ query string (nếu có)
        const searchQuery = req.query.search; // Lấy từ khóa tìm kiếm (nếu có)

        const whereCondition = {
             stock_quantity: { [Op.gt]: 0 } // Chỉ hiển thị sản phẩm còn hàng
        };

        if (categoryId) {
            whereCondition.category_id = categoryId;
        }

        if (searchQuery) {
            whereCondition.name = { [Op.like]: `%${searchQuery}%` }; // Tìm kiếm theo tên sản phẩm
        }


        const products = await Product.findAll({
            where: whereCondition,
            include: Category,
            order: [['name', 'ASC']] // Sắp xếp theo tên
        });

        const categories = await Category.findAll(); // Lấy danh sách danh mục để lọc


        res.render('client/products/index', {
            title: 'Danh sách Sản phẩm',
            products,
            categories,
            selectedCategoryId: categoryId, // Truyền category đã chọn để highlight trên giao diện
            searchQuery: searchQuery, // Truyền từ khóa tìm kiếm để hiển thị lại
             // res.locals.user đã có
        });
    } catch (err) {
        console.error('Lỗi lấy danh sách sản phẩm:', err);
        // logger.error(`Client Product List Error: ${err.message}`);
        res.status(500).send('Lỗi máy chủ khi lấy danh sách sản phẩm.');
    }
};

// Hiển thị chi tiết sản phẩm (Client)
exports.detail = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id, {
            include: Category,
            where: { stock_quantity: { [Op.gt]: 0 } } // Chỉ lấy sản phẩm còn hàng
        });

        if (!product) {
             // logger.warn(`Client Product Detail: Product ${req.params.id} not found or out of stock.`);
            return res.status(404).send('Sản phẩm không tồn tại hoặc đã hết hàng.');
        }

        res.render('client/products/detail', {
            title: product.name,
            product,
             // res.locals.user đã có
        });
    } catch (err) {
        console.error('Lỗi lấy chi tiết sản phẩm:', err);
        // logger.error(`Client Product Detail Error: ${err.message}`);
        res.status(500).send('Lỗi máy chủ khi lấy chi tiết sản phẩm.');
    }
};