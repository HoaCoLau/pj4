// controllers/admin/categoryController.js
const { Category } = require('../../models');
const logger = require('../../config/logger'); // Import Pino logger

// GET: Hiển thị trang danh sách categories
exports.showCategoriesPage = async (req, res, next) => {
  try {
    // Lấy thông báo từ query param (nếu có, thay cho flash)
    const successMsg = req.query.success === 'true' ? 'Operation successful!' : null;
    const errorMsg = req.query.error; // Ví dụ: ?error=constraint

    const categories = await Category.findAll({ order: [['name', 'ASC']] });
    res.render('admin/categories/index', {
      categories: categories,
      pageTitle: 'Manage Categories',
      success_msg: successMsg, // Truyền thông báo vào view
      error_msg: errorMsg ? (errorMsg === 'constraint' ? 'Cannot delete category associated with products.' : 'An error occurred.') : null
    });
  } catch (error) {
    logger.error({ err: error }, 'Error fetching categories for view');
    next(error);
  }
};

// GET: Hiển thị form thêm mới
exports.showAddCategoryForm = (req, res) => {
    res.render('admin/categories/form', {
        pageTitle: 'Add New Category',
        editing: false,
        category: req.bodyInput || {}, // Dùng dữ liệu cũ nếu có lỗi validation trước đó
        errors: req.validationErrors || null, // Lỗi từ Joi middleware
        csrfToken: req.csrfToken ? req.csrfToken() : null // Nếu dùng csurf
    });
};

// POST: Xử lý thêm mới
exports.handleCreateCategory = async (req, res, next) => {
  // Kiểm tra lỗi Joi từ middleware
  if (req.validationErrors) {
      logger.warn('Category creation validation failed:', { errors: req.validationErrors, input: req.bodyInput });
      // Render lại form với lỗi và dữ liệu đã nhập
      return res.status(400).render('admin/categories/form', {
          pageTitle: 'Add New Category',
          editing: false,
          category: req.bodyInput,
          errors: req.validationErrors,
          csrfToken: req.csrfToken ? req.csrfToken() : null
      });
  }

  const { name } = req.validatedBody || req.body;

  try {
    const newCategory = await Category.create({ name });
    logger.info(`Category created by User ID ${req.user?.id}: ID ${newCategory.id}, Name: ${name}`);
    res.redirect('/admin/categories?success=true'); // Redirect với query param
  } catch (error) {
    logger.error({ err: error, userId: req.user?.id }, 'Error creating category');
    if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).render('admin/categories/form', {
             pageTitle: 'Add New Category',
             editing: false,
             category: { name }, // Giữ lại tên đã nhập
             errors: { name: 'Category name already exists.' }, // Lỗi cụ thể cho trường name
             csrfToken: req.csrfToken ? req.csrfToken() : null
        });
    }
    next(error); // Chuyển lỗi khác cho global handler
  }
};

// GET: Hiển thị form sửa
exports.showEditCategoryForm = async (req, res, next) => {
    try {
        const categoryId = req.params.id;
        // Validate ID là số nguyên dương (có thể thêm middleware Joi cho params)
        if (isNaN(parseInt(categoryId)) || parseInt(categoryId) <= 0) {
             const error = new Error('Invalid Category ID');
             error.statusCode = 400;
             return next(error);
        }

        const category = await Category.findByPk(categoryId);
        if (!category) {
             logger.warn(`Edit category attempt failed: Category ID ${categoryId} not found.`);
             const error = new Error('Category not found');
             error.statusCode = 404;
             return next(error);
        }
        res.render('admin/categories/form', {
            pageTitle: 'Edit Category',
            editing: true,
            category: req.bodyInput || category.get({ plain: true }), // Ưu tiên input lỗi, nếu không thì lấy từ DB
            errors: req.validationErrors || null,
            csrfToken: req.csrfToken ? req.csrfToken() : null
        });
    } catch (error) {
        logger.error({ err: error, categoryId: req.params.id }, 'Error fetching category for edit');
        next(error);
    }
};

// POST: Xử lý cập nhật
exports.handleUpdateCategory = async (req, res, next) => {
    const categoryId = req.params.id;
     // Validate ID
     if (isNaN(parseInt(categoryId)) || parseInt(categoryId) <= 0) {
        const error = new Error('Invalid Category ID');
        error.statusCode = 400;
        return next(error);
    }

    // Kiểm tra lỗi Joi
    if (req.validationErrors) {
         logger.warn(`Category update validation failed for ID ${categoryId}:`, { errors: req.validationErrors, input: req.bodyInput });
         // Cần có ID để render lại đúng action của form
         return res.status(400).render('admin/categories/form', {
             pageTitle: 'Edit Category',
             editing: true,
             category: { id: categoryId, ...(req.bodyInput || {}) }, // Giữ lại ID và input lỗi
             errors: req.validationErrors,
              csrfToken: req.csrfToken ? req.csrfToken() : null
         });
    }

    const { name } = req.validatedBody || req.body;

    try {
        const category = await Category.findByPk(categoryId);
        if (!category) {
            logger.warn(`Update category failed: Category ID ${categoryId} not found.`);
            const error = new Error('Category not found');
            error.statusCode = 404;
            return next(error);
        }

        await category.update({ name });
        logger.info(`Category updated by User ID ${req.user?.id}: ID ${categoryId}`);
        res.redirect('/admin/categories?success=true');
    } catch (error) {
        logger.error({ err: error, userId: req.user?.id, categoryId }, 'Error updating category');
        if (error.name === 'SequelizeUniqueConstraintError') {
             return res.status(400).render('admin/categories/form', {
                 pageTitle: 'Edit Category',
                 editing: true,
                 category: { id: categoryId, name: name },
                 errors: { name: 'Category name already exists.' },
                 csrfToken: req.csrfToken ? req.csrfToken() : null
             });
        }
        next(error);
    }
};

// POST: Xử lý xóa
exports.handleDeleteCategory = async (req, res, next) => {
    const categoryId = req.params.id;
     // Validate ID
     if (isNaN(parseInt(categoryId)) || parseInt(categoryId) <= 0) {
        const error = new Error('Invalid Category ID');
        error.statusCode = 400;
        return next(error);
    }
    try {
        const category = await Category.findByPk(categoryId);
        if (!category) {
            logger.warn(`Delete category failed: Category ID ${categoryId} not found.`);
            // Chuyển hướng với lỗi query param
            return res.redirect('/admin/categories?error=notfound');
        }
        await category.destroy();
        logger.info(`Category deleted by User ID ${req.user?.id}: ID ${categoryId}`);
        res.redirect('/admin/categories?success=true');
    } catch (error) {
        logger.error({ err: error, userId: req.user?.id, categoryId }, 'Error deleting category');
        if (error.name === 'SequelizeForeignKeyConstraintError') {
            // Lỗi khóa ngoại do còn sản phẩm thuộc category này
            return res.redirect('/admin/categories?error=constraint');
        }
        next(error); // Chuyển lỗi khác cho global handler
    }
};