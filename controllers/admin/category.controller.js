const db = require("../../models");
const Category = db.categories;
const Op = db.Op;
const categorySchema = require("../../validation/category.validation.js");
const logger = require('../../config/logger');

// Render trang danh sách danh mục (Admin)
exports.listCategories = async (req, res) => { // Sử dụng async
  req.log.info('Rendering admin category list');
  try { // Bắt đầu try block
    const data = await Category.findAll(); // Sử dụng await
    res.render("admin/categories/index", {
      title: "Quản lý Danh mục",
      categories: data,
    });
  } catch (err) { // Bắt đầu catch block
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
exports.createCategoryProcess = async (req, res) => { // Sử dụng async
  const { error, value } = categorySchema.validate(req.body, { abortEarly: false });

  if (error) {
    logger.warn(`Validation failed for category creation: ${error.details.map(x => x.message).join(', ')}`);
    return res.redirect(`/admin/categories/create?error=${error.details[0].message}`);
  }

  try { // Bắt đầu try block
    const data = await Category.create({ name: value.name }); // Sử dụng await
    logger.info(`Category created: ${data.name}`);
    res.redirect("/admin/categories?success=Thêm danh mục thành công!");
  } catch (err) { // Bắt đầu catch block
    logger.error({ err }, "Lỗi khi tạo danh mục.");
     if (err.name === 'SequelizeUniqueConstraintError') {
         return res.redirect(`/admin/categories/create?error=Tên danh mục đã tồn tại.`);
     }
    res.redirect(`/admin/categories/create?error=${err.message || "Đã xảy ra lỗi khi tạo danh mục."}`);
  }
};

// Render trang chỉnh sửa danh mục (Admin)
exports.editCategoryForm = async (req, res) => { // Sử dụng async
  const id = req.params.categoryId;
  req.log.info(`Rendering admin category edit form for ID: ${id}`);
  try { // Bắt đầu try block
    const data = await Category.findByPk(id); // Sử dụng await
    if (data) {
      res.render("admin/categories/edit", { title: "Chỉnh sửa Danh mục", category: data });
    } else {
      logger.warn(`Category not found for edit: ${id}`);
      res.status(404).render("user/errorPage", { title: "Không tìm thấy", message: `Không tìm thấy danh mục với id=${id}.` });
    }
  } catch (err) { // Bắt đầu catch block
     logger.error({ err }, `Lỗi khi lấy thông tin danh mục ${id} để chỉnh sửa.`);
     res.status(500).render("user/errorPage", { title: "Lỗi Database", message: "Lỗi khi lấy thông tin danh mục để chỉnh sửa: " + err.message });
  }
};

// Xử lý submit form chỉnh sửa danh mục (POST với method-override PUT)
exports.updateCategoryProcess = async (req, res) => { // Sử dụng async
   const id = req.params.categoryId;
   const { error, value } = categorySchema.validate(req.body, { abortEarly: false });

   if (error) {
      logger.warn(`Validation failed for category update (${id}): ${error.details.map(x => x.message).join(', ')}`);
      return res.redirect(`/admin/categories/edit/${id}?error=${error.details[0].message}`);
   }

   try { // Bắt đầu try block
     const num = await Category.update(value, { where: { id: id } }); // Sử dụng await
       if (num[0] === 1) {
           logger.info(`Category updated: ${id}`);
           res.redirect("/admin/categories?success=Cập nhật danh mục thành công!");
       } else {
           logger.warn(`Category not found or no changes for update: ${id}`);
           res.redirect(`/admin/categories/edit/${id}?error=Không tìm thấy hoặc không có gì để cập nhật.`);
       }
   } catch (err) { // Bắt đầu catch block
       logger.error({ err }, `Lỗi khi cập nhật danh mục ${id}.`);
        if (err.name === 'SequelizeUniqueConstraintError') {
            return res.redirect(`/admin/categories/edit/${id}?error=Tên danh mục đã tồn tại.`);
        }
       res.redirect(`/admin/categories/edit/${id}?error=${err.message || "Đã xảy ra lỗi khi cập nhật danh mục."}`);
   }
};

// Xử lý request xóa danh mục (POST với method-override DELETE)
exports.deleteCategoryProcess = async (req, res) => { // Sử dụng async
    const id = req.params.categoryId;
    req.log.info(`Attempting to delete category ID: ${id}`);

    try { // Bắt đầu try block
      const num = await Category.destroy({ where: { id: id } }); // Sử dụng await
        if (num === 1) {
            logger.info(`Category deleted: ${id}`);
            res.redirect("/admin/categories?success=Xóa danh mục thành công!");
        } else {
             logger.warn(`Category not found for deletion: ${id}`);
             res.redirect("/admin/categories?error=Không tìm thấy danh mục để xóa.");
        }
    } catch (err) { // Bắt đầu catch block
         logger.error({ err }, `Lỗi khi xóa danh mục ${id}.`);
          if (err.name === 'SequelizeForeignKeyConstraintError') {
              return res.redirect(`/admin/categories?error=Không thể xóa danh mục này vì vẫn còn sản phẩm liên quan.`);
          }
         res.redirect(`/admin/categories?error=${err.message || "Đã xảy ra lỗi khi xóa danh mục."}`);
    }
};
