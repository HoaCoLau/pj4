// controllers/public/productController.js
const { Product, Category, sequelize } = require('../../models'); // Import models và sequelize instance
const logger = require('../../config/logger');
const { Op } = require("sequelize");

// GET: Hiển thị danh sách sản phẩm công khai
exports.showProductList = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 9;
        const offset = (page - 1) * limit;

        const categoryNameFilter = req.query.category;
        const searchQuery = req.query.search || '';
        const sortOrder = req.query.sort || 'newest';

        let whereCondition = {};
        let pageTitleForView = 'Tất cả Sản phẩm';
        let currentCategory = null;

        if (categoryNameFilter) {
            const category = await Category.findOne({ where: { name: categoryNameFilter } });
            if (category) {
                whereCondition.categoryId = category.id;
                pageTitleForView = category.name;
                currentCategory = category;
            } else {
                 logger.warn(`Public product list: Category name "${categoryNameFilter}" not found.`);
            }
        }

        if (searchQuery) {
            whereCondition.name = { [Op.like]: `%${searchQuery}%` };
        }

        let orderOption = [['createdAt', 'DESC']];
        if (sortOrder === 'price_asc') orderOption = [['price', 'ASC']];
        else if (sortOrder === 'price_desc') orderOption = [['price', 'DESC']];
        else if (sortOrder === 'name_asc') orderOption = [['name', 'ASC']];
        else if (sortOrder === 'name_desc') orderOption = [['name', 'DESC']];

        const { count, rows: products } = await Product.findAndCountAll({
            where: whereCondition,
            include: { model: Category, as: 'category', attributes: ['id', 'name'] },
            order: orderOption,
            limit: limit,
            offset: offset,
            distinct: true,
        });

        const totalPages = Math.ceil(count / limit);
        const categories = await Category.findAll({ order: [['name', 'ASC']] });

        res.render('public/products/index', {
            pageTitle: pageTitleForView,
            products: products.map(p => p.get({ plain: true })), // Chuyển sang plain object
            categories: categories.map(c => c.get({ plain: true })),
            currentPage: page,
            totalPages: totalPages,
            selectedCategory: currentCategory ? currentCategory.name : null, // Truyền tên category đã chọn
            searchQuery: searchQuery,
            sortOrder: sortOrder,
            path: '/products'
        });
    } catch (error) {
        logger.error({ err: error }, 'Error fetching public product list');
        next(error);
    }
};

// GET: Hiển thị chi tiết một sản phẩm công khai
exports.showProductDetail = async (req, res, next) => {
    try {
        const productId = req.params.id;
        if (isNaN(parseInt(productId)) || parseInt(productId) <= 0) {
            const error = new Error('Invalid Product ID format.');
            error.statusCode = 400;
            return next(error);
        }

        const product = await Product.findByPk(productId, {
            include: { model: Category, as: 'category' }
        });

        if (!product) {
            logger.warn(`Public product detail: Product ID ${productId} not found.`);
            const error = new Error('Sản phẩm không tồn tại.');
            error.statusCode = 404;
            return next(error);
        }

        let relatedProducts = [];
        if (product.categoryId) {
            relatedProducts = await Product.findAll({
                where: {
                    categoryId: product.categoryId,
                    id: { [Op.ne]: productId }
                },
                limit: 4,
                order: sequelize.random() // Hoặc [['createdAt', 'DESC']]
            });
        }

        res.render('public/products/detail', {
            pageTitle: product.name,
            product: product.get({ plain: true }),
            relatedProducts: relatedProducts.map(p => p.get({ plain: true })),
            path: `/products/${product.id}` // Path chi tiết hơn
        });
    } catch (error) {
        logger.error({ err: error, productId: req.params.id }, 'Error fetching public product detail');
        next(error);
    }
};