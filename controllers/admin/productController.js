// controllers/admin/productController.js
const { Product, Category } = require('../../models'); // Import Product và Category models
const logger = require('../../config/logger');
const fs = require('fs'); // Để làm việc với file system (xóa ảnh)
const path = require('path'); // Để làm việc với đường dẫn file
const { Op } = require("sequelize"); // Để dùng các toán tử của Sequelize (ví dụ: Op.like)

// Helper function để xóa file ảnh (nếu có)
const deleteProductImage = (imageUrl) => {
    if (imageUrl) {
        // imageUrl lưu trong DB thường là dạng /uploads/images/filename.jpg
        // Cần lấy đường dẫn tuyệt đối đến file trong thư mục public
        const imagePath = path.join(__dirname, '../../public', imageUrl);
        fs.unlink(imagePath, (err) => {
            if (err) {
                // Không ném lỗi nghiêm trọng nếu không xóa được ảnh cũ, chỉ log lại
                logger.warn({ err, imagePath }, 'Failed to delete product image file');
            } else {
                logger.info(`Deleted product image file: ${imagePath}`);
            }
        });
    }
};


// GET: Hiển thị trang danh sách sản phẩm
exports.showProductsPage = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10; // Số sản phẩm mỗi trang
        const offset = (page - 1) * limit;

        const searchQuery = req.query.search || '';
        const categoryFilter = req.query.category || '';

        let whereCondition = {};
        if (searchQuery) {
            whereCondition.name = { [Op.like]: `%${searchQuery}%` };
        }
        if (categoryFilter && !isNaN(parseInt(categoryFilter))) {
            whereCondition.categoryId = parseInt(categoryFilter);
        }

        const { count, rows: products } = await Product.findAndCountAll({
            where: whereCondition,
            include: [{
                model: Category,
                as: 'category', // Alias đã định nghĩa trong model/index.js
                attributes: ['id', 'name']
            }],
            order: [['createdAt', 'DESC']],
            limit: limit,
            offset: offset
        });

        const categories = await Category.findAll({ order: [['name', 'ASC']] });
        const totalPages = Math.ceil(count / limit);

        res.render('admin/products/index', {
            pageTitle: 'Manage Products',
            products: products,
            categories: categories, // Cho filter dropdown
            currentPage: page,
            totalPages: totalPages,
            searchQuery: searchQuery,
            selectedCategory: categoryFilter,
            success_msg: req.query.success === 'true' ? 'Operation successful!' : null,
            error_msg: req.query.error ? 'An error occurred. Please check logs.' : null, // Thông báo lỗi chung
        });
    } catch (error) {
        logger.error({ err: error }, 'Error fetching products for admin view');
        next(error);
    }
};

// GET: Hiển thị form thêm sản phẩm
exports.showAddProductForm = async (req, res, next) => {
    try {
        const categories = await Category.findAll({ order: [['name', 'ASC']] });
        res.render('admin/products/form', {
            pageTitle: 'Add New Product',
            editing: false,
            product: req.bodyInput || {}, // Dữ liệu cũ nếu có lỗi validation
            categories: categories,
            errors: req.validationErrors || null, // Lỗi Joi
            // csrfToken: req.csrfToken ? req.csrfToken() : null // Nếu dùng csurf
        });
    } catch (error) {
        logger.error({ err: error }, 'Error fetching categories for add product form');
        next(error);
    }
};

// POST: Xử lý thêm sản phẩm
exports.handleCreateProduct = async (req, res, next) => {
    const { name, price, categoryId, description, stockQuantity } = req.validatedBody || req.body;
    const imageFile = req.file; // Thông tin file ảnh từ uploadMiddleware (Multer)

    // Kiểm tra lỗi Joi (validationMiddleware đã chạy trước)
    if (req.validationErrors) {
        logger.warn('Product creation validation failed:', { errors: req.validationErrors, input: req.bodyInput });
        if (imageFile) deleteProductImage(`/uploads/images/${imageFile.filename}`); // Xóa ảnh đã upload nếu validation lỗi
        const categories = await Category.findAll({ order: [['name', 'ASC']] }); // Cần categories để render lại form
        return res.status(400).render('admin/products/form', {
            pageTitle: 'Add New Product',
            editing: false,
            product: req.bodyInput,
            categories: categories,
            errors: req.validationErrors
        });
    }

    // Kiểm tra xem categoryId có hợp lệ không (nếu Joi không check DB)
    try {
        const category = await Category.findByPk(categoryId);
        if (!category) {
            logger.warn(`Product creation failed: Category ID ${categoryId} not found.`);
            if (imageFile) deleteProductImage(`/uploads/images/${imageFile.filename}`);
            const categories = await Category.findAll({ order: [['name', 'ASC']] });
            return res.status(400).render('admin/products/form', {
                pageTitle: 'Add New Product',
                editing: false,
                product: req.body,
                categories: categories,
                errors: { categoryId: 'Selected category is invalid.' }
            });
        }
    } catch (dbError) {
        if (imageFile) deleteProductImage(`/uploads/images/${imageFile.filename}`);
        return next(dbError);
    }


    const imageUrl = imageFile ? `/uploads/images/${imageFile.filename}` : null;

    try {
        const newProduct = await Product.create({
            name,
            price,
            categoryId,
            description,
            stockQuantity: stockQuantity || 0, // Đảm bảo có giá trị
            imageUrl: imageUrl
        });
        logger.info(`Product created by User ID ${req.user?.id}: ID ${newProduct.id}, Name: ${name}`);
        res.redirect('/admin/products?success=true');
    } catch (error) {
        logger.error({ err: error, userId: req.user?.id, productData: req.body }, 'Error creating product');
        // Xóa file ảnh đã upload nếu có lỗi DB
        if (imageFile) deleteProductImage(imageUrl);

        const categories = await Category.findAll({ order: [['name', 'ASC']] });
        let dbErrors = { general: 'Failed to create product. Please try again.' };
        if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
            dbErrors = error.errors.reduce((acc, errItem) => {
                acc[errItem.path] = errItem.message;
                return acc;
            }, {});
        }
        return res.status(500).render('admin/products/form', {
            pageTitle: 'Add New Product',
            editing: false,
            product: req.body,
            categories: categories,
            errors: dbErrors
        });
    }
};

// GET: Hiển thị form sửa sản phẩm
exports.showEditProductForm = async (req, res, next) => {
    try {
        const productId = req.params.id;
        if (isNaN(parseInt(productId)) || parseInt(productId) <= 0) { /* Validate ID */ }

        const product = await Product.findByPk(productId);
        if (!product) {
            logger.warn(`Edit product failed: Product ID ${productId} not found.`);
            const error = new Error('Product not found');
            error.statusCode = 404;
            return next(error);
        }
        const categories = await Category.findAll({ order: [['name', 'ASC']] });
        res.render('admin/products/form', {
            pageTitle: `Edit Product: ${product.name}`,
            editing: true,
            product: req.bodyInput || product.get({ plain: true }),
            categories: categories,
            errors: req.validationErrors || null
        });
    } catch (error) {
        logger.error({ err: error, productId: req.params.id }, 'Error fetching product for edit');
        next(error);
    }
};

// POST: Xử lý cập nhật sản phẩm
exports.handleUpdateProduct = async (req, res, next) => {
    const productId = req.params.id;
    if (isNaN(parseInt(productId)) || parseInt(productId) <= 0) { /* Validate ID */ }

    const { name, price, categoryId, description, stockQuantity } = req.validatedBody || req.body;
    const imageFile = req.file; // Ảnh mới (nếu có)

    // Kiểm tra lỗi Joi
    if (req.validationErrors) {
        logger.warn(`Product update validation failed for ID ${productId}:`, { errors: req.validationErrors, input: req.bodyInput });
        if (imageFile) deleteProductImage(`/uploads/images/${imageFile.filename}`); // Xóa ảnh mới upload nếu validation lỗi
        const categories = await Category.findAll({ order: [['name', 'ASC']] });
        // Cần product.id cho action của form
        return res.status(400).render('admin/products/form', {
            pageTitle: 'Edit Product',
            editing: true,
            product: { id: productId, ...(req.bodyInput || {}) },
            categories: categories,
            errors: req.validationErrors
        });
    }

    try {
        const product = await Product.findByPk(productId);
        if (!product) {
            logger.warn(`Update product failed: Product ID ${productId} not found.`);
            if (imageFile) deleteProductImage(`/uploads/images/${imageFile.filename}`);
            const error = new Error('Product not found');
            error.statusCode = 404;
            return next(error);
        }

        // Kiểm tra categoryId mới có hợp lệ không
        if (categoryId) {
            const category = await Category.findByPk(categoryId);
            if (!category) {
                logger.warn(`Product update failed: New Category ID ${categoryId} not found.`);
                if (imageFile) deleteProductImage(`/uploads/images/${imageFile.filename}`);
                const categories = await Category.findAll({ order: [['name', 'ASC']] });
                 return res.status(400).render('admin/products/form', {
                    pageTitle: 'Edit Product',
                    editing: true,
                    product: { id: productId, ...req.body },
                    categories: categories,
                    errors: { categoryId: 'Selected category is invalid.' }
                });
            }
        }


        let oldImageUrl = product.imageUrl;
        let newImageUrl = product.imageUrl; // Mặc định giữ ảnh cũ

        if (imageFile) {
            newImageUrl = `/uploads/images/${imageFile.filename}`;
        }

        await product.update({
            name,
            price,
            categoryId,
            description,
            stockQuantity: stockQuantity || 0,
            imageUrl: newImageUrl
        });

        // Nếu update thành công VÀ có ảnh mới VÀ ảnh cũ tồn tại -> Xóa ảnh cũ
        if (imageFile && oldImageUrl && oldImageUrl !== newImageUrl) {
            deleteProductImage(oldImageUrl);
        }

        logger.info(`Product updated by User ID ${req.user?.id}: ID ${productId}`);
        res.redirect('/admin/products?success=true');
    } catch (error) {
        logger.error({ err: error, userId: req.user?.id, productId, productData: req.body }, 'Error updating product');
        // Xóa ảnh mới upload nếu có lỗi DB
        if (imageFile) deleteProductImage(`/uploads/images/${imageFile.filename}`);
        // Render lại form với lỗi DB
        const categories = await Category.findAll({ order: [['name', 'ASC']] });
        let dbErrors = { general: 'Failed to update product. Please try again.' };
        if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
            // Xử lý lỗi cụ thể từ Sequelize nếu cần
        }
        return res.status(500).render('admin/products/form', {
            pageTitle: 'Edit Product',
            editing: true,
            product: { id: productId, ...req.body }, // Giữ lại dữ liệu đang cố gắng update
            categories: categories,
            errors: dbErrors
        });
    }
};

// POST: Xử lý xóa sản phẩm
exports.handleDeleteProduct = async (req, res, next) => {
    const productId = req.params.id;
    if (isNaN(parseInt(productId)) || parseInt(productId) <= 0) { /* Validate ID */ }

    try {
        const product = await Product.findByPk(productId);
        if (!product) {
            logger.warn(`Delete product failed: Product ID ${productId} not found.`);
            return res.redirect('/admin/products?error=notfound');
        }

        const imageUrlToDelete = product.imageUrl; // Lưu lại đường dẫn ảnh để xóa file

        await product.destroy(); // Xóa product khỏi DB

        // Xóa file ảnh liên quan nếu xóa product thành công
        if (imageUrlToDelete) {
            deleteProductImage(imageUrlToDelete);
        }

        logger.info(`Product deleted by User ID ${req.user?.id}: ID ${productId}`);
        res.redirect('/admin/products?success=true');
    } catch (error) {
        logger.error({ err: error, userId: req.user?.id, productId }, 'Error deleting product');
        if (error.name === 'SequelizeForeignKeyConstraintError') {
            // Lỗi khóa ngoại (ví dụ: sản phẩm có trong order detail)
            return res.redirect('/admin/products?error=constraint_product');
        }
        next(error);
    }
};