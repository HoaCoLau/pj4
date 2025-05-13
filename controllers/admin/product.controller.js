// controllers/admin/product.controller.js
const { Product, Category } = require('../../models');
const logger = require('../../config/logger.config');
const Joi = require('joi');
const fs = require('fs');
const path = require('path');

// Joi Schema for product validation
const productSchema = Joi.object({
    name: Joi.string().min(3).required().messages({
        'string.empty': 'Tên sản phẩm không được để trống.',
        'string.min': 'Tên sản phẩm phải có ít nhất {#limit} ký tự.',
        'any.required': 'Tên sản phẩm là bắt buộc.'
    }),
    price: Joi.number().positive().required().messages({
        'number.base': 'Giá phải là một số.',
        'number.positive': 'Giá phải là số dương.',
        'any.required': 'Giá là bắt buộc.'
    }),
    category_id: Joi.number().integer().positive().allow(null, '').optional(),
    description: Joi.string().allow('', null).optional(),
    stock_quantity: Joi.number().integer().min(0).required().messages({
        'number.base': 'Số lượng tồn phải là một số.',
        'number.integer': 'Số lượng tồn phải là số nguyên.',
        'number.min': 'Số lượng tồn không được âm.',
        'any.required': 'Số lượng tồn là bắt buộc.'
    })
});

// GET: Display list of products
exports.getAllProducts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10; // Products per page
        const offset = (page - 1) * limit;

        const { count, rows: products } = await Product.findAndCountAll({
            include: [{ model: Category, as: 'category', attributes: ['id', 'name'] }],
            order: [['createdAt', 'DESC']],
            limit: limit,
            offset: offset,
            distinct: true
        });

        res.render('admin/products/index', {
            layout: 'admin/layouts/main', // Chỉ định layout cho admin
            title: 'Quản lý Sản phẩm',
            products: products.map(p => p.toJSON()),
            currentPage: page,
            totalPages: Math.ceil(count / limit)
        });
    } catch (error) {
        logger.error('Admin: Error fetching products:', error);
        req.flash('error_msg', 'Không thể tải danh sách sản phẩm.');
        res.redirect('/admin/dashboard'); // Hoặc một trang lỗi admin
    }
};

// GET: Show form to create a new product
exports.showCreateForm = async (req, res) => {
    try {
        const categories = await Category.findAll({ order: [['name', 'ASC']] });
        res.render('admin/products/create', {
            layout: 'admin/layouts/main',
            title: 'Thêm Sản phẩm mới',
            categories: categories.map(c => c.toJSON()),
            productData: {}, // For form binding, empty for create
            errors: null
        });
    } catch (error) {
        logger.error('Admin: Error fetching categories for create product form:', error);
        req.flash('error_msg', 'Lỗi tải trang thêm sản phẩm.');
        res.redirect('/admin/products');
    }
};

// POST: Create a new product
exports.createProduct = async (req, res) => {
    const { error, value } = productSchema.validate(req.body, { abortEarly: false });
    let categoriesForForm = [];
    try {
        categoriesForForm = await Category.findAll({ order: [['name', 'ASC']] });
    } catch (catError) {
        logger.error('Admin: Error fetching categories during product creation error handling:', catError);
    }


    if (error) {
        const validationErrors = error.details.reduce((acc, current) => {
            acc[current.path[0]] = current.message;
            return acc;
        }, {});
        if (req.file) { // Nếu có lỗi validation và đã upload file, xóa file đó đi
            fs.unlink(req.file.path, (err) => {
                if (err) logger.error('Error deleting uploaded file after validation error:', err);
            });
        }
        return res.status(400).render('admin/products/create', {
            layout: 'admin/layouts/main',
            title: 'Thêm Sản phẩm mới',
            categories: categoriesForForm.map(c => c.toJSON()),
            productData: value,
            errors: validationErrors
        });
    }

    try {
        const productData = { ...value };
        if (req.file) {
            productData.image_url = '/images/uploads/' + req.file.filename; // Đảm bảo thư mục uploads tồn tại trong public/images
        }
        if (productData.category_id === '' || productData.category_id === null || productData.category_id === undefined) {
            productData.category_id = null;
        }

        await Product.create(productData);
        req.flash('success_msg', 'Sản phẩm đã được tạo thành công!');
        res.redirect('/admin/products');
    } catch (err) {
        logger.error('Admin: Error creating product:', err);
         if (req.file) { // Nếu có lỗi khi tạo DB và đã upload file, xóa file đó đi
            fs.unlink(req.file.path, (unlinkErr) => {
                if (unlinkErr) logger.error('Error deleting uploaded file after DB creation error:', unlinkErr);
            });
        }
        req.flash('error_msg', 'Lỗi khi tạo sản phẩm: ' + (err.errors ? err.errors.map(e=>e.message).join(', ') : err.message) );
        res.status(500).render('admin/products/create', {
            layout: 'admin/layouts/main',
            title: 'Thêm Sản phẩm mới',
            categories: categoriesForForm.map(c => c.toJSON()),
            productData: value,
            errors: { general: 'Lỗi server khi tạo sản phẩm.' }
        });
    }
};

// GET: Show form to edit a product
exports.showEditForm = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) {
            req.flash('error_msg', 'Sản phẩm không tồn tại.');
            return res.redirect('/admin/products');
        }
        const categories = await Category.findAll({ order: [['name', 'ASC']] });
        res.render('admin/products/edit', {
            layout: 'admin/layouts/main',
            title: 'Sửa Sản phẩm: ' + product.name,
            productData: product.toJSON(),
            categories: categories.map(c => c.toJSON()),
            errors: null
        });
    } catch (error) {
        logger.error(`Admin: Error fetching product for edit (ID: ${req.params.id}):`, error);
        req.flash('error_msg', 'Lỗi tải thông tin sản phẩm để sửa.');
        res.redirect('/admin/products');
    }
};

// POST: Update a product
exports.updateProduct = async (req, res) => {
    const productId = req.params.id;
    const { error, value } = productSchema.validate(req.body, { abortEarly: false });
    let categoriesForForm = [];
    let productInstance;

    try {
        categoriesForForm = await Category.findAll({ order: [['name', 'ASC']] });
        productInstance = await Product.findByPk(productId);
        if (!productInstance) {
            req.flash('error_msg', 'Sản phẩm không tồn tại.');
            return res.redirect('/admin/products');
        }
    } catch(fetchError){
        logger.error('Admin: Error fetching data for product update:', fetchError);
        req.flash('error_msg', 'Lỗi khi tải dữ liệu để cập nhật sản phẩm.');
        return res.redirect('/admin/products');
    }


    if (error) {
        const validationErrors = error.details.reduce((acc, current) => {
            acc[current.path[0]] = current.message;
            return acc;
        }, {});
         if (req.file) { // Nếu có lỗi validation và đã upload file mới, xóa file đó đi
            fs.unlink(req.file.path, (err) => {
                if (err) logger.error('Error deleting new uploaded file after validation error:', err);
            });
        }
        return res.status(400).render('admin/products/edit', {
            layout: 'admin/layouts/main',
            title: 'Sửa Sản phẩm: ' + productInstance.name,
            productData: { ...productInstance.toJSON(), ...value }, // Giữ lại ảnh cũ, merge với giá trị lỗi
            categories: categoriesForForm.map(c => c.toJSON()),
            errors: validationErrors
        });
    }

    try {
        const updateData = { ...value };
        const oldImageUrl = productInstance.image_url;

        if (req.file) {
            updateData.image_url = '/images/uploads/' + req.file.filename;
            // Xóa ảnh cũ nếu có ảnh mới và ảnh cũ không phải là placeholder
            if (oldImageUrl && oldImageUrl !== updateData.image_url && !oldImageUrl.includes('placeholder')) {
                const oldImagePath = path.join(__dirname, '../../public', oldImageUrl);
                fs.unlink(oldImagePath, (err) => {
                    if (err) logger.warn(`Could not delete old image ${oldImagePath}:`, err);
                });
            }
        } else {
            updateData.image_url = oldImageUrl; // Giữ ảnh cũ nếu không có ảnh mới
        }
        if (updateData.category_id === '' || updateData.category_id === null || updateData.category_id === undefined) {
            updateData.category_id = null;
        }

        await Product.update(updateData, { where: { id: productId } });
        req.flash('success_msg', 'Sản phẩm đã được cập nhật thành công!');
        res.redirect('/admin/products');
    } catch (err) {
        logger.error(`Admin: Error updating product (ID: ${productId}):`, err);
        // Nếu có lỗi DB và đã upload file mới, xóa file đó đi
        if (req.file && updateData.image_url !== oldImageUrl) {
            fs.unlink(req.file.path, (unlinkErr) => {
                if (unlinkErr) logger.error('Error deleting new uploaded file after DB update error:', unlinkErr);
            });
        }
        req.flash('error_msg', 'Lỗi khi cập nhật sản phẩm: ' + (err.errors ? err.errors.map(e=>e.message).join(', ') : err.message) );
        res.status(500).render('admin/products/edit', {
            layout: 'admin/layouts/main',
            title: 'Sửa Sản phẩm: ' + productInstance.name,
            productData: { ...productInstance.toJSON(), ...value },
            categories: categoriesForForm.map(c => c.toJSON()),
            errors: { general: 'Lỗi server khi cập nhật sản phẩm.' }
        });
    }
};

// POST: Delete a product
exports.deleteProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        const product = await Product.findByPk(productId);
        if (!product) {
            req.flash('error_msg', 'Sản phẩm không tồn tại.');
            return res.redirect('/admin/products');
        }

        const imageUrl = product.image_url;
        await product.destroy(); // Hoặc Product.destroy({ where: { id: productId }})

        // Xóa ảnh liên quan
        if (imageUrl && !imageUrl.includes('placeholder')) {
            const imagePath = path.join(__dirname, '../../public', imageUrl);
            fs.unlink(imagePath, (err) => {
                if (err) logger.warn(`Could not delete image ${imagePath} after deleting product:`, err);
            });
        }

        req.flash('success_msg', 'Sản phẩm đã được xóa thành công!');
        res.redirect('/admin/products');
    } catch (error) {
        logger.error(`Admin: Error deleting product (ID: ${req.params.id}):`, error);
        req.flash('error_msg', 'Lỗi khi xóa sản phẩm.');
        res.redirect('/admin/products');
    }
};          