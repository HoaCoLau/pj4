const db = require("../../models");
const Category = db.categories;
const categorySchema = require("../../validation/category.validation.js");
const logger = require('../../config/logger');

// Render trang danh sách danh mục (Admin)
exports.listCategories = async (req, res) => {
  req.log.info('Rendering admin category list');
  try {
    const data = await Category.findAll();
    res.render("admin/categories/index", {
      title: "Quản lý Danh mục",
      categories: data,
    });
  } catch (err) {
    logger.error({ err }, "Lỗi khi lấy danh sách danh mục.");
    res.status(500).render("user/errorPage", { title: "Lỗi Database", message: err.message || "Lỗi khi lấy danh sách danh mục." });
  }
};

// Render trang thêm mới danh mục (Admin)
exports.createCategoryForm = (req, res) => {
    req.log.info('Rendering admin category create form');
    res.render("admin/categories/create", { title: "Thêm mới Danh mục" });
};

// Xử lý submit form thêm mới danh mục (POST)
exports.createCategoryProcess = async (req, res) => {
  const { error, value } = categorySchema.validate(req.body);
  if (error) {
    logger.warn(`Validation failed for category creation: ${error.details[0].message}`);
    return res.redirect(`/admin/categories/create?error=${error.details[0].message}`);
  }
  try {
    await Category.create({ name: value.name });
    logger.info(`Category created: ${value.name}`);
    res.redirect("/admin/categories?success=Thêm danh mục thành công!");
  } catch (err) {
     if (err.name === 'SequelizeUniqueConstraintError') {
         logger.warn(`Category creation failed: Name already exists - ${value.name}`);
         return res.redirect(`/admin/categories/create?error=Tên danh mục đã tồn tại.`);
     }
    logger.error({ err }, "Lỗi khi tạo danh mục.");
    res.redirect(`/admin/categories/create?error=${err.message || "Đã xảy ra lỗi khi tạo danh mục."}`);
  }
};

// Render trang chỉnh sửa danh mục (Admin)
exports.editCategoryForm = async (req, res) => {
  const id = req.params.categoryId;
  req.log.info(`Rendering admin category edit form for ID: ${id}`);
  try {
    const data = await Category.findByPk(id);
    if (data) { res.render("admin/categories/edit", { title: "Chỉnh sửa Danh mục", category: data }); }
    else { logger.warn(`Category not found for edit: ${id}`); res.status(404).render("user/errorPage", { title: "Không tìm thấy", message: `Không tìm thấy danh mục với id=${id}.` }); }
  } catch (err) {
     logger.error({ err }, `Lỗi khi lấy thông tin danh mục ${id} để chỉnh sửa.`);
     res.status(500).render("user/errorPage", { title: "Lỗi Database", message: "Lỗi khi lấy thông tin danh mục để chỉnh sửa: " + err.message });
  }
};

// Xử lý submit form chỉnh sửa danh mục (POST với method-override PUT)
exports.updateCategoryProcess = async (req, res) => {
   const id = req.params.categoryId;
   const { error, value } = categorySchema.validate(req.body);
   if (error) {
      logger.warn(`Validation failed for category update (${id}): ${error.details[0].message}`);
      return res.redirect(`/admin/categories/edit/${id}?error=${error.details[0].message}`);
   }
   try {
     const num = await Category.update(value, { where: { id: id } });
       if (num[0] === 1) {
           logger.info(`Category updated: ${id}`);
           res.redirect("/admin/categories?success=Cập nhật danh mục thành công!");
       } else {
           logger.warn(`Category not found or no changes for update: ${id}`);
           res.redirect(`/admin/categories/edit/${id}?error=Không tìm thấy hoặc không có gì để cập nhật.`);
       }
   } catch (err) {
       logger.error({ err }, `Lỗi khi cập nhật danh mục ${id}.`);
        if (err.name === 'SequelizeUniqueConstraintError') {
             logger.warn(`Category update failed: Name already exists - ${value.name}`);
            return res.redirect(`/admin/categories/edit/${id}?error=Tên danh mục đã tồn tại.`);
        }
       res.redirect(`/admin/categories/edit/${id}?error=${err.message || "Đã xảy ra lỗi khi cập nhật danh mục."}`);
   }
};

// Xử lý request xóa danh mục (POST với method-override DELETE)
exports.deleteCategoryProcess = async (req, res) => {
    const id = req.params.categoryId;
    req.log.info(`Attempting to delete category ID: ${id}`);
    try {
      const num = await Category.destroy({ where: { id: id } });
        if (num === 1) {
            logger.info(`Category deleted: ${id}`);
            res.redirect("/admin/categories?success=Xóa danh mục thành công!");
        } else {
             logger.warn(`Category not found for deletion: ${id}`);
             res.redirect("/admin/categories?error=Không tìm thấy danh mục để xóa.");
        }
    } catch (err) {
         logger.error({ err }, `Lỗi khi xóa danh mục ${id}.`);
          if (err.name === 'SequelizeForeignKeyConstraintError') {
              logger.warn(`Category deletion failed: Foreign key constraint - ${id}`);
              return res.redirect(`/admin/categories?error=Không thể xóa danh mục này vì vẫn còn sản phẩm liên quan.`);
          }
         res.redirect(`/admin/categories?error=${err.message || "Đã xảy ra lỗi khi xóa danh mục."}`);
    }
};
