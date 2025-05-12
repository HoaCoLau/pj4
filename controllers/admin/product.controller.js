const db = require("../../models");
const Product = db.products;
const Category = db.categories;
const productSchema = require("../../validation/product.validation.js");
const logger = require('../../config/logger');
const { uploadProductImage, uploadDir } = require('../../middleware/upload');
const fs = require('fs');
const path = require('path');

// Helper function to delete file
const deleteFile = (filePath) => {
    fs.unlink(filePath, (err) => {
        if (err) logger.error({ err }, `Failed to delete file: ${filePath}`);
        else logger.debug(`Deleted file: ${filePath}`);
    });
};

// Render trang danh sách sản phẩm (Admin)
exports.listProducts = async (req, res) => {
    req.log.info('Rendering admin product list');
    try {
        const data = await Product.findAll({ include: ['category'] });
        res.render("admin/products/index", { title: "Quản lý Sản phẩm", products: data });
    } catch (err) { logger.error({ err }, "Lỗi khi lấy danh sách sản phẩm."); res.status(500).render("user/errorPage", { title: "Lỗi Database", message: err.message || "Lỗi khi lấy danh sách sản phẩm." }); }
};

// Render form thêm mới sản phẩm (Admin)
exports.createProductForm = async (req, res) => {
     req.log.info('Rendering admin product create form');
     try {
       const categories = await Category.findAll();
        res.render("admin/products/create", { title: "Thêm mới Sản phẩm", categories: categories });
     } catch (err) { logger.error({ err }, "Lỗi khi lấy danh sách danh mục cho form sản phẩm."); res.status(500).render("user/errorPage", { title: "Lỗi Database", message: err.message || "Lỗi khi lấy danh sách danh mục." }); }
};

// Xử lý submit form thêm mới sản phẩm (POST)
exports.createProductProcess = (req, res, next) => {
    uploadProductImage(req, res, async (err) => {
        if (err) {
            logger.warn(`File upload error during product creation: ${err.message}`);
            return res.redirect(`/admin/products/create?error=${err.message}`);
        }
        const { error, value } = productSchema.validate(req.body);
        if (error) {
            if (req.file) deleteFile(req.file.path);
            logger.warn(`Validation failed for product creation: ${error.details[0].message}`);
            return res.redirect(`/admin/products/create?error=${error.details[0].message}`);
        }
        const productData = {
            name: value.name, price: value.price, category_id: value.category_id,
            description: value.description, stock_quantity: value.stock_quantity,
            image_url: req.file ? `/images/${req.file.filename}` : (value.image_url || null)
        };
        try {
            await Product.create(productData);
            logger.info(`Product created: ${value.name}`);
            res.redirect("/admin/products?success=Thêm sản phẩm thành công!");
        } catch (dbErr) {
            if (req.file) deleteFile(req.file.path);
            logger.error({ err: dbErr }, "Lỗi khi tạo sản phẩm.");
            res.redirect(`/admin/products/create?error=${dbErr.message || "Đã xảy ra lỗi khi tạo sản phẩm."}`);
        }
    });
};

// Render form chỉnh sửa sản phẩm (Admin)
exports.editProductForm = async (req, res) => {
    const id = req.params.productId;
    req.log.info(`Rendering admin product edit form for ID: ${id}`);
    try {
        const [product, categories] = await Promise.all([
            Product.findByPk(id, { include: ['category'] }),
            Category.findAll()
        ]);
        if (product) { res.render("admin/products/edit", { title: "Chỉnh sửa Sản phẩm", product: product, categories: categories }); }
        else { logger.warn(`Product not found for edit form: ${id}`); res.status(404).render("user/errorPage", { title: "Không tìm thấy", message: `Không tìm thấy sản phẩm với id=${id}.` }); }
    } catch (err) { logger.error({ err }, `Lỗi khi lấy thông tin sản phẩm ${id} hoặc danh mục.`); res.status(500).render("user/errorPage", { title: "Lỗi Database", message: "Lỗi khi lấy thông tin sản phẩm/danh mục: " + err.message }); }
};

// Xử lý submit form chỉnh sửa sản phẩm (POST với method-override PUT)
exports.updateProductProcess = (req, res, next) => {
     const id = req.params.productId;
     uploadProductImage(req, res, async (err) => {
         if (err) {
             logger.warn(`File upload error during product update (${id}): ${err.message}`);
             return res.redirect(`/admin/products/edit/${id}?error=${err.message}`);
         }
         const { error, value } = productSchema.validate(req.body);
         if (error) {
             if (req.file) deleteFile(req.file.path);
             logger.warn(`Validation failed for product update (${id}): ${error.details[0].message}`);
             return res.redirect(`/admin/products/edit/${id}?error=${error.details[0].message}`);
         }
         const productData = {
             name: value.name, price: value.price, category_id: value.category_id,
             description: value.description, stock_quantity: value.stock_quantity,
         };
         let oldImageUrl = null;
         try {
             const existingProduct = await Product.findByPk(id);
             if (!existingProduct) {
                 if (req.file) deleteFile(req.file.path);
                 logger.warn(`Product not found for update: ${id}`);
                 return res.redirect(`/admin/products/edit/${id}?error=Không tìm thấy sản phẩm để cập nhật.`);
             }
             oldImageUrl = existingProduct.image_url;

             if (req.file) {
                 productData.image_url = `/images/${req.file.filename}`;
                 if (oldImageUrl && oldImageUrl !== '/images/placeholder.png') {
                      const oldImagePath = path.join(__dirname, '../../public', oldImageUrl);
                      fs.access(oldImagePath, fs.constants.F_OK, (accessErr) => {
                          if (!accessErr) deleteFile(oldImagePath);
                          else logger.debug(`Old product image not found for update: ${oldImagePath}`);
                      });
                  }
             } else if (value.image_url === '') {
                  productData.image_url = null;
                  if (oldImageUrl && oldImageUrl !== '/images/placeholder.png') {
                       const oldImagePath = path.join(__dirname, '../../public', oldImageUrl);
                       fs.access(oldImagePath, fs.constants.F_OK, (accessErr) => {
                           if (!accessErr) deleteFile(oldImagePath);
                           else logger.debug(`Old product image not found when clearing URL: ${oldImagePath}`);
                       });
                   }
             }
             const num = await Product.update(productData, { where: { id: id } });
             if (num[0] === 1) { logger.info(`Product updated: ${id}`); res.redirect("/admin/products?success=Cập nhật sản phẩm thành công!"); }
             else {
                  if (req.file) deleteFile(req.file.path);
                  logger.warn(`Product update resulted in no changes: ${id}`);
                  res.redirect(`/admin/products/edit/${id}?error=Không tìm thấy hoặc không có gì để cập nhật.`);
             }
         } catch (dbErr) {
              if (req.file) deleteFile(req.file.path);
              logger.error({ err: dbErr }, `Lỗi khi cập nhật sản phẩm ${id}.`);
              res.redirect(`/admin/products/edit/${id}?error=${dbErr.message || "Đã xảy ra lỗi khi cập nhật sản phẩm."}`);
         }
     });
};

// Xử lý request xóa sản phẩm (POST với method-override DELETE)
exports.deleteProductProcess = async (req, res) => {
     const id = req.params.productId;
    req.log.info(`Attempting to delete product ID: ${id}`);
    try {
        const product = await Product.findByPk(id);
        if (!product) {
             logger.warn(`Product not found for deletion: ${id}`);
             return res.redirect("/admin/products?error=Không tìm thấy sản phẩm để xóa.");
        }
        const imageUrl = product.image_url;
        const num = await Product.destroy({ where: { id: id } });
        if (num === 1) {
            logger.info(`Product deleted: ${id}`);
            if (imageUrl && imageUrl !== '/images/placeholder.png') {
                const imagePath = path.join(__dirname, '../../public', imageUrl);
                 fs.access(imagePath, fs.constants.F_OK, (accessErr) => {
                     if (!accessErr) deleteFile(imagePath);
                     else logger.debug(`Product image not found for deletion, no need to delete: ${imagePath}`);
                 });
            }
            res.redirect("/admin/products?success=Xóa sản phẩm thành công!");
        } else {
             logger.warn(`Product found but not deleted: ${id}`);
             res.redirect("/admin/products?error=Không tìm thấy sản phẩm để xóa.");
        }
    } catch (err) {
         logger.error({ err }, `Lỗi khi xóa sản phẩm ${id}.`);
         res.redirect(`/admin/products?error=${err.message || "Đã xảy ra lỗi khi xóa sản phẩm."}`);
    }
};
