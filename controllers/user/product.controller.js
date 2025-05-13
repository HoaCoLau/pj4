// controllers/user/product.controller.js
const { Product, Category, sequelize } = require('../../models');
const { Op } = require('sequelize');
const logger =require('../../config/logger.config');
const Joi = require('joi');

exports.getAllProducts = async (req, res) => {
    try {
        const { category: categoryId, search, sort, page = 1 } = req.query;
        const limit = 12; // Số sản phẩm mỗi trang
        const offset = (parseInt(page) - 1) * limit;

        const whereClause = {};
        if (categoryId) {
            whereClause.category_id = categoryId;
        }
        if (search) {
            whereClause[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { description: { [Op.like]: `%${search}%` } }
            ];
        }

        const orderClause = [];
        if (sort === 'price_asc') orderClause.push(['price', 'ASC']);
        else if (sort === 'price_desc') orderClause.push(['price', 'DESC']);
        else if (sort === 'name_asc') orderClause.push(['name', 'ASC']);
        else if (sort === 'name_desc') orderClause.push(['name', 'DESC']);
        else orderClause.push(['createdAt', 'DESC']); // Mặc định mới nhất

        const { count, rows: products } = await Product.findAndCountAll({
            where: whereClause,
            include: [{ model: Category, as: 'category', attributes: ['id', 'name'] }],
            limit: limit,
            offset: offset,
            order: orderClause,
            distinct: true, // Cần thiết khi include và có limit/offset để count chính xác
        });

        const totalProducts = count;
        const totalPages = Math.ceil(totalProducts / limit);
        const categories = await Category.findAll({ order: [['name', 'ASC']] });

        res.render('user/products', {
            title: 'Danh sách Sản phẩm',
            products: products.map(p => p.toJSON()),
            categories: categories.map(c => c.toJSON()),
            currentPage: parseInt(page),
            totalPages: totalPages,
            currentCategory: categoryId,
            currentSearch: search,
            currentSort: sort,
            query: req.query // Để giữ lại các filter khi chuyển trang
        });

    } catch (error) {
        logger.error('Error fetching all products with Sequelize:', error);
        res.status(500).render('user/error', { title: 'Lỗi Server', message: 'Không thể tải danh sách sản phẩm.'});
    }
};

exports.getProductById = async (req, res) => {
    try {
        const productId = req.params.id;
        const { error: idError } = Joi.number().integer().positive().validate(productId);
        if (idError) {
            logger.warn(`Invalid product ID requested: ${productId}`);
            req.flash('error_msg', 'ID sản phẩm không hợp lệ.');
            return res.status(400).redirect('/products');
        }

        const product = await Product.findByPk(productId, {
            include: [{ model: Category, as: 'category', attributes: ['id', 'name'] }]
        });

        if (!product) {
            req.flash('error_msg', 'Sản phẩm không tồn tại.');
            return res.status(404).redirect('/products');
        }

        let relatedProducts = [];
        if (product.category) { // Nếu sản phẩm có category
            relatedProducts = await Product.findAll({
                where: {
                    category_id: product.category.id,
                    id: { [Op.ne]: product.id } // Khác sản phẩm hiện tại
                },
                limit: 4,
                order: [sequelize.fn('RAND')] // Lấy ngẫu nhiên (cho MySQL)
            });
        } else {
             relatedProducts = await Product.findAll({
                where: { id: { [Op.ne]: product.id } },
                limit: 4,
                order: [sequelize.fn('RAND')]
            });
        }

        res.render('user/product-detail', {
            title: product.name,
            product: product.toJSON(),
            relatedProducts: relatedProducts.map(p => p.toJSON())
        });
    } catch (error) {
        logger.error(`Error fetching product by ID ${req.params.id} with Sequelize:`, error);
        req.flash('error_msg', 'Không thể tải thông tin sản phẩm.');
        res.status(500).redirect('/');
    }
};