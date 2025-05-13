// controllers/admin/category.controller.js
const { Category, Product } = require('../../models');
const logger = require('../../config/logger.config');
const Joi = require('joi');

const categorySchema = Joi.object({
    name: Joi.string().min(2).max(100).required().messages({
        'string.empty': 'Tên danh mục không được để trống.',
        'string.min': 'Tên danh mục phải có ít nhất {#limit} ký tự.',
        'any.required': 'Tên danh mục là bắt buộc.'
    })
});

// GET: Display list of categories
exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.findAll({
            order: [['name', 'ASC']],
            // include: [{ model: Product, attributes: ['id'] }] // Để đếm số sản phẩm (tùy chọn)
        });
        // Nếu muốn đếm sản phẩm cho từng category:
        const categoriesWithProductCount = await Promise.all(categories.map(async (cat) => {
            const productCount = await Product.count({ where: { category_id: cat.id } });
            return { ...cat.toJSON(), productCount };
        }));


        res.render('admin/categories/index', {
            layout: 'admin/layouts/main',
            title: 'Quản lý Danh mục',
            categories: categoriesWithProductCount
        });
    } catch (error) {
        logger.error('Admin: Error fetching categories:', error);
        req.flash('error_msg', 'Không thể tải danh sách danh mục.');
        res.redirect('/admin/dashboard');
    }
};

// GET: Show form to create/edit a category
exports.showCategoryForm = async (req, res) => {
    const categoryId = req.params.id;
    let categoryData = {};
    let formTitle = 'Thêm Danh mục mới';
    if (categoryId) {
        try {
            const category = await Category.findByPk(categoryId);
            if (category) {
                categoryData = category.toJSON();
                formTitle = 'Sửa Danh mục: ' + category.name;
            } else {
                req.flash('error_msg', 'Danh mục không tồn tại.');
                return res.redirect('/admin/categories');
            }
        } catch (error) {
            logger.error(`Admin: Error fetching category ID ${categoryId} for edit:`, error);
            req.flash('error_msg', 'Lỗi tải thông tin danh mục.');
            return res.redirect('/admin/categories');
        }
    }
    res.render('admin/categories/form', { // View form dùng chung cho create/edit
        layout: 'admin/layouts/main',
        title: formTitle,
        categoryData: categoryData,
        errors: null
    });
};

// POST: Create or Update a category
exports.saveCategory = async (req, res) => {
    const categoryId = req.params.id; // Nếu có id là update, không thì là create
    const { error, value } = categorySchema.validate(req.body, { abortEarly: false });

    if (error) {
        const validationErrors = error.details.reduce((acc, current) => {
            acc[current.path[0]] = current.message; return acc;
        }, {});
        let formTitle = categoryId ? 'Sửa Danh mục' : 'Thêm Danh mục mới';
        if (categoryId && value.name) formTitle = 'Sửa Danh mục: ' + value.name; // Giữ tên nếu có
        else if(value.name) formTitle = 'Thêm Danh mục mới'


        return res.status(400).render('admin/categories/form', {
            layout: 'admin/layouts/main',
            title: formTitle,
            categoryData: { id: categoryId, ...value },
            errors: validationErrors
        });
    }

    try {
        if (categoryId) { // Update
            const category = await Category.findByPk(categoryId);
            if (!category) {
                req.flash('error_msg', 'Danh mục không tồn tại.');
                return res.redirect('/admin/categories');
            }
            await category.update({ name: value.name });
            req.flash('success_msg', 'Danh mục đã được cập nhật thành công!');
        } else { // Create
            await Category.create({ name: value.name });
            req.flash('success_msg', 'Danh mục đã được tạo thành công!');
        }
        res.redirect('/admin/categories');
    } catch (err) {
        logger.error(`Admin: Error saving category (ID: ${categoryId || 'new'}):`, err);
        let errorMessage = 'Lỗi khi lưu danh mục.';
        if (err.name === 'SequelizeUniqueConstraintError') {
            errorMessage = 'Tên danh mục này đã tồn tại.';
        }
        let formTitle = categoryId ? 'Sửa Danh mục' : 'Thêm Danh mục mới';
         if (categoryId && value.name) formTitle = 'Sửa Danh mục: ' + value.name;
         else if(value.name) formTitle = 'Thêm Danh mục mới';


        res.status(500).render('admin/categories/form', {
            layout: 'admin/layouts/main',
            title: formTitle,
            categoryData: { id: categoryId, ...value },
            errors: { general: errorMessage }
        });
    }
};

// POST: Delete a category
exports.deleteCategory = async (req, res) => {
    try {
        const categoryId = req.params.id;
        const category = await Category.findByPk(categoryId);
        if (!category) {
            req.flash('error_msg', 'Danh mục không tồn tại.');
            return res.redirect('/admin/categories');
        }

        // Kiểm tra xem có sản phẩm nào thuộc danh mục này không
        const productsInCategory = await Product.count({ where: { category_id: categoryId } });
        if (productsInCategory > 0) {
            req.flash('error_msg', `Không thể xóa danh mục "${category.name}" vì còn sản phẩm thuộc danh mục này. Các sản phẩm sẽ được set category_id = NULL nếu bạn vẫn xóa.`);
            // Hoặc bạn có thể không cho phép xóa hoàn toàn:
            // req.flash('error_msg', `Không thể xóa danh mục "${category.name}" vì còn ${productsInCategory} sản phẩm thuộc danh mục này.`);
            // return res.redirect('/admin/categories');
        }

        await category.destroy();
        // Do constraint `ON DELETE SET NULL` trên products.category_id,
        // các sản phẩm thuộc danh mục này sẽ có category_id = NULL.
        req.flash('success_msg', 'Danh mục đã được xóa thành công!');
        res.redirect('/admin/categories');
    } catch (error) {
        logger.error(`Admin: Error deleting category (ID: ${req.params.id}):`, error);
        req.flash('error_msg', 'Lỗi khi xóa danh mục.');
        res.redirect('/admin/categories');
    }
};