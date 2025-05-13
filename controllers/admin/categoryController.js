// controllers/admin/categoryController.js
const db = require('../../models');
const Category = db.category;
const Product = db.product; // Cần để kiểm tra khi xóa danh mục
const Joi = require('joi');
// const logger = require('../../config/logger');

const categorySchema = Joi.object({
    name: Joi.string().required().messages({'any.required': 'Tên danh mục là bắt buộc.'}),
});

// Hiển thị danh sách danh mục (Admin)
exports.index = async (req, res) => {
    try {
        const categories = await Category.findAll({
             order: [['id', 'DESC']]
        });
        res.render('admin/categories/index', {
            title: 'Quản lý Danh mục',
            categories,
            success: req.query.success,
            error: req.query.error
        });
    } catch (err) {
        console.error('Lỗi lấy danh sách danh mục:', err);
        // logger.error(`Admin Category Index Error: ${err.message}`);
        res.status(500).send('Lỗi máy chủ khi lấy danh sách danh mục.');
    }
};

// Hiển thị form thêm danh mục mới (Admin)
exports.create = (req, res) => {
    res.render('admin/categories/create', {
        title: 'Thêm Danh mục mới',
        error: null,
        oldInput: {}
    });
};

// Xử lý thêm danh mục mới (Admin)
exports.store = async (req, res) => {
    const { error, value } = categorySchema.validate(req.body, { abortEarly: false });

    if (error) {
         const errors = error.details.map(detail => detail.message);
        return res.render('admin/categories/create', {
            title: 'Thêm Danh mục mới',
            error: errors,
            oldInput: req.body
        });
    }

    try {
        const { name } = value;

        // Kiểm tra tên danh mục đã tồn tại chưa (tùy chọn)
        const existingCategory = await Category.findOne({ where: { name } });
        if (existingCategory) {
             return res.render('admin/categories/create', {
                title: 'Thêm Danh mục mới',
                error: ['Tên danh mục đã tồn tại.'],
                oldInput: req.body
             });
        }

        await Category.create({ name });

        // logger.info(`Admin created category: ${name}`);

        res.redirect('/admin/categories?success=' + encodeURIComponent('Thêm danh mục thành công!'));

    } catch (err) {
        console.error('Lỗi khi thêm danh mục:', err);
        // logger.error(`Admin Category Store Error: ${err.message}`);
        res.render('admin/categories/create', {
            title: 'Thêm Danh mục mới',
            error: ['Có lỗi xảy ra khi thêm danh mục. Vui lòng thử lại.'],
            oldInput: req.body
        });
    }
};

// Hiển thị form sửa danh mục (Admin)
exports.edit = async (req, res) => {
    try {
        const category = await Category.findByPk(req.params.id);
        if (!category) {
             // logger.warn(`Admin Category Edit Form: Category ${req.params.id} not found.`);
            return res.status(404).send('Danh mục không tồn tại.');
        }
        res.render('admin/categories/edit', {
            title: 'Sửa Danh mục',
            category,
            error: null
        });
    } catch (err) {
        console.error('Lỗi hiển thị form sửa danh mục:', err);
        // logger.error(`Admin Category Edit Form Error: ${err.message}`);
        res.status(500).send('Lỗi máy chủ khi hiển thị form sửa danh mục.');
    }
};

// Xử lý cập nhật danh mục (Admin)
exports.update = async (req, res) => {
    const { error, value } = categorySchema.validate(req.body, { abortEarly: false });
    const categoryId = req.params.id;

    if (error) {
         const errors = error.details.map(detail => detail.message);
         const category = await Category.findByPk(categoryId); // Lấy lại category cũ
          if (!category) { return res.status(404).send('Danh mục không tồn tại.'); }
         return res.render('admin/categories/edit', {
            title: 'Sửa Danh mục',
            category,
            error: errors
         });
    }

    try {
        const category = await Category.findByPk(categoryId);
        if (!category) {
             // logger.warn(`Admin Category Update: Category ${categoryId} not found.`);
            return res.status(404).send('Danh mục không tồn tại.');
        }

        const { name } = value;

         // Kiểm tra tên danh mục đã tồn tại chưa (trừ chính danh mục đang sửa)
         const existingCategory = await Category.findOne({ where: { name, id: { [db.Sequelize.Op.ne]: categoryId } } });
         if (existingCategory) {
              return res.render('admin/categories/edit', {
                 title: 'Sửa Danh mục',
                 category,
                 error: ['Tên danh mục đã tồn tại.']
              });
         }


        await category.update({ name });

        // logger.info(`Admin updated category: ${categoryId}`);

        res.redirect('/admin/categories?success=' + encodeURIComponent('Cập nhật danh mục thành công!'));

    } catch (err) {
        console.error('Lỗi khi cập nhật danh mục:', err);
         // logger.error(`Admin Category Update Error: ${err.message}`);
         const category = await Category.findByPk(categoryId);
          if (!category) { return res.status(404).send('Danh mục không tồn tại.'); }
         res.render('admin/categories/edit', {
             title: 'Sửa Danh mục',
             category,
             error: ['Có lỗi xảy ra khi cập nhật danh mục. Vui lòng thử lại.']
         });
    }
};

// Xử lý xóa danh mục (Admin)
exports.delete = async (req, res) => {
    try {
        const category = await Category.findByPk(req.params.id);
        if (!category) {
             // logger.warn(`Admin Category Delete: Category ${req.params.id} not found.`);
             return res.redirect('/admin/categories?error=' + encodeURIComponent('Danh mục không tồn tại.'));
        }

        // Kiểm tra xem có sản phẩm nào thuộc danh mục này không
        const productCount = await Product.count({ where: { category_id: req.params.id } });
        if (productCount > 0) {
            // logger.warn(`Admin Category Delete: Cannot delete category ${req.params.id}, it has products.`);
            return res.redirect('/admin/categories?error=' + encodeURIComponent('Không thể xóa danh mục vì còn sản phẩm thuộc danh mục này.'));
        }

        await category.destroy();

        // logger.info(`Admin deleted category: ${req.params.id}`);

        res.redirect('/admin/categories?success=' + encodeURIComponent('Xóa danh mục thành công!'));

    } catch (err) {
        console.error('Lỗi khi xóa danh mục:', err);
        // logger.error(`Admin Category Delete Error: ${err.message}`);
         res.redirect('/admin/categories?error=' + encodeURIComponent('Có lỗi xảy ra khi xóa danh mục.'));
    }
};