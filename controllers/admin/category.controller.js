const db = require("../../models");
const Category = db.categories;
const Op = db.Op;
const categorySchema = require("../../validation/category.validation.js"); // Import schema
const logger = require('../../config/logger'); // Import logger

// Render trang danh sách danh mục (Admin) - Chỉ cần fetch data và render
exports.listCategories = (req, res) => {
  Category.findAll()
    .then(data => {
      res.render("admin/categories/index", {
        title: "Quản lý Danh mục",
        categories: data,
        // user, query đã có trong res.locals
      });
    })
    .catch(err => {
      logger.error({ err }, "Lỗi khi lấy danh sách danh mục.");
      res.status(500).render("user/errorPage", { title: "Lỗi Database", message: err.message || "Lỗi khi lấy danh sách danh mục." });
    });
};

// Render trang thêm mới danh mục (Admin)
exports.createCategoryForm = (req, res) => {
  res.render("admin/categories/create", {
      title: "Thêm mới Danh mục"
      // user, query đã có trong res.locals
  });
};

// Xử lý submit form thêm mới danh mục (POST)
exports.createCategoryProcess = (req, res) => {
  // ** Validation sử dụng Joi **
  const { error, value } = categorySchema.validate(req.body, { abortEarly: false });

  if (error) {
    logger.warn(`Validation failed for category creation: ${error.details.map(x => x.message).join(', ')}`);
    return res.redirect(`/admin/categories/create?error=${error.details[0].message}`);
  }

  // Dữ liệu hợp lệ, tiếp tục tạo category
  Category.create({ name: value.name }) // Sử dụng value sau khi validate
    .then(data => {
      logger.info(`Category created: ${data.name}`);
      res.redirect("/admin/categories?success=Thêm danh mục thành công!");
    })
    .catch(err => {
      logger.error({ err }, "Lỗi khi tạo danh mục.");
      // Xử lý lỗi trùng tên nếu database có ràng buộc UNIQUE
      // if (err.name === 'SequelizeUniqueConstraintError') {
      //     return res.redirect(`/admin/categories/create?error=Tên danh mục đã tồn tại.`);
      // }
      res.redirect(`/admin/categories/create?error=${err.message || "Lỗi khi tạo danh mục."}`);
    });
};

// Render trang chỉnh sửa danh mục (Admin)
exports.editCategoryForm = (req, res) => {
  const id = req.params.categoryId;
  Category.findByPk(id)
    .then(data => {
      if (data) {
        res.render("admin/categories/edit", {
            title: "Chỉnh sửa Danh mục",
            category: data
            // user, query đã có trong res.locals
        });
      } else {
        logger.warn(`Category not found for edit: ${id}`);
        res.status(404).render("user/errorPage", { title: "Không tìm thấy", message: `Không tìm thấy danh mục với id=${id}.` });
      }
    })
    .catch(err => {
       logger.error({ err }, `Lỗi khi lấy thông tin danh mục ${id} để chỉnh sửa.`);
       res.status(500).render("user/errorPage", { title: "Lỗi Database", message: "Lỗi khi lấy thông tin danh mục để chỉnh sửa: " + err.message });
    });
};

// Xử lý submit form chỉnh sửa danh mục (POST với method-override PUT)
exports.updateCategoryProcess = (req, res) => {
   const id = req.params.categoryId;

   // ** Validation sử dụng Joi **
   const { error, value } = categorySchema.validate(req.body, { abortEarly: false });

   if (error) {
      logger.warn(`Validation failed for category update (${id}): ${error.details.map(x => x.message).join(', ')}`);
      return res.redirect(`/admin/categories/edit/${id}?error=${error.details[0].message}`);
   }

   // Dữ liệu hợp lệ, tiếp tục cập nhật
   Category.update(value, { where: { id: id } }) // Sử dụng value sau khi validate
       .then(num => {
           if (num[0] === 1) {
               logger.info(`Category updated: ${id}`);
               res.redirect("/admin/categories?success=Cập nhật danh mục thành công!");
           } else {
               logger.warn(`Category not found or no changes for update: ${id}`);
               // Có thể redirect lại form chỉnh sửa hoặc về trang list tùy yêu cầu
               res.redirect(`/admin/categories/edit/${id}?error=Không tìm thấy hoặc không có gì để cập nhật.`);
           }
       })
       .catch(err => {
           logger.error({ err }, `Lỗi khi cập nhật danh mục ${id}.`);
            // Xử lý lỗi trùng tên nếu database có ràng buộc UNIQUE
            // if (err.name === 'SequelizeUniqueConstraintError') {
            //     return res.redirect(`/admin/categories/edit/${id}?error=Tên danh mục đã tồn tại.`);
            // }
           res.redirect(`/admin/categories/edit/${id}?error=${err.message || "Lỗi khi cập nhật danh mục."}`);
       });
};

// Xử lý request xóa danh mục (POST với method-override DELETE)
exports.deleteCategoryProcess = (req, res) => {
    const id = req.params.categoryId;
    // Xóa không cần validation body, chỉ validate id nếu cần thiết (ví dụ: id là số nguyên > 0)

    Category.destroy({ where: { id: id } })
        .then(num => {
            if (num === 1) {
                logger.info(`Category deleted: ${id}`);
                res.redirect("/admin/categories?success=Xóa danh mục thành công!");
            } else {
                 logger.warn(`Category not found for deletion: ${id}`);
                 res.redirect("/admin/categories?error=Không tìm thấy danh mục để xóa.");
            }
        })
        .catch(err => {
             logger.error({ err }, `Lỗi khi xóa danh mục ${id}.`);
             // Xử lý lỗi ràng buộc khóa ngoại (ví dụ: còn sản phẩm thuộc danh mục này)
             // if (err.name === 'SequelizeForeignKeyConstraintError') {
             //     return res.redirect(`/admin/categories?error=Không thể xóa danh mục này vì vẫn còn sản phẩm liên quan.`);
             // }
             res.redirect(`/admin/categories?error=${err.message || "Lỗi khi xóa danh mục."}`);
        });
};