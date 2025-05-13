// controllers/public/productController.js
const { Product, Category } = require('../../models'); // Import models
const logger = require('../../config/logger');
const { Op } = require("sequelize"); // Dùng cho tìm kiếm

// GET: Hiển thị danh sách tất cả sản phẩm (có thể có filter, search, pagination)
exports.showProductList = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 9; // Số sản phẩm mỗi trang cho giao diện public
        const offset = (page - 1) * limit;

        const categorySlug = req.query.category; // Lấy category slug/id từ query
        const searchQuery = req.query.search || '';
        const sortOrder = req.query.sort || 'newest'; // 'newest', 'price_asc', 'price_desc'

        let whereCondition = {};
        let categoryName = 'All Products'; // Mặc định

        if (categorySlug) {
            // Tìm category theo slug (hoặc ID nếu bạn dùng ID)
            const category = await Category.findOne({ where: { name: categorySlug } }); // Giả sử slug là name
            if (category) {
                whereCondition.categoryId = category.id;
                categoryName = category.name;
            } else {
                 logger.warn(`Public product list: Category slug/name "${categorySlug}" not found.`);
                 // Có thể redirect về trang products không filter hoặc hiển thị lỗi
            }
        }

        if (searchQuery) {
            whereCondition.name = { [Op.like]: `%${searchQuery}%` };
        }

        let orderOption = [['createdAt', 'DESC']]; // Mặc định mới nhất
        if (sortOrder === 'price_asc') {
            orderOption = [['price', 'ASC']];
        } else if (sortOrder === 'price_desc') {
            orderOption = [['price', 'DESC']];
        }


        const { count, rows: products } = await Product.findAndCountAll({
            where: whereCondition,
            include: { model: Category, as: 'category', attributes: ['id', 'name'] },
            order: orderOption,
            limit: limit,
            offset: offset,
            distinct: true, // Quan trọng khi có include và limit/offset
        });

        const totalPages = Math.ceil(count / limit);
        const categories = await Category.findAll({ order: [['name', 'ASC']] });

        res.render('public/products/index', {
            pageTitle: categoryName,
            products: products,
            categories: categories, // Cho filter dropdown
            currentPage: page,
            totalPages: totalPages,
            selectedCategory: categorySlug, // Giữ trạng thái filter
            searchQuery: searchQuery,    // Giữ trạng thái search
            sortOrder: sortOrder,        // Giữ trạng thái sort
            path: '/products'            // Cho active menu
        });
    } catch (error) {
        logger.error({ err: error }, 'Error fetching public product list');
        next(error);
    }
};

// GET: Hiển thị chi tiết một sản phẩm
exports.showProductDetail = async (req, res, next) => {
    try {
        const productId = req.params.id;
        if (isNaN(parseInt(productId)) || parseInt(productId) <= 0) {
            const error = new Error('Invalid Product ID');
            error.statusCode = 400;
            return next(error);
        }

        const product = await Product.findByPk(productId, {
            include: { model: Category, as: 'category' }
        });

        if (!product) {
            logger.warn(`Public product detail: Product ID ${productId} not found.`);
            const error = new Error('Product not found');
            error.statusCode = 404;
            return next(error);
        }

        // Lấy sản phẩm liên quan (ví dụ: cùng category, trừ sản phẩm hiện tại)
        let relatedProducts = [];
        if (product.categoryId) {
            relatedProducts = await Product.findAll({
                where: {
                    categoryId: product.categoryId,
                    id: { [Op.ne]: productId } // Khác sản phẩm hiện tại
                },
                limit: 4, // Giới hạn số lượng
                order: sequelize.random() // Lấy ngẫu nhiên (tùy DB hỗ trợ) hoặc theo tiêu chí khác
            });
        }

        res.render('public/products/detail', {
            pageTitle: product.name,
            product: product.get({ plain: true }),
            relatedProducts: relatedProducts,
            path: '/products' // Hoặc path chi tiết hơn nếu cần
        });
    } catch (error) {
        logger.error({ err: error, productId: req.params.id }, 'Error fetching public product detail');
        next(error);
    }
};