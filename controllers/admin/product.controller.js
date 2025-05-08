const db = require("../../models");
const Product = db.products;
const Category = db.categories;
const Op = db.Op;
const productSchema = require("../../validation/product.validation.js"); // Import schema
const logger = require('../../config/logger');

// Render trang danh sách sản phẩm
exports.listProducts = (req, res) => { /* ... logic fetch products ... */
    Product.findAll({ include: ['category'] })
        .then(data => {
             res.render("admin/products/index", { title: "Quản lý Sản phẩm", products: data });
        })
        .catch(err => { logger.error({ err }, "Lỗi khi lấy danh sách sản phẩm."); res.status(500).render("user/errorPage", { title: "Lỗi Database", message: err.message || "Lỗi khi lấy danh sách sản phẩm." }); });
};

// Render form thêm mới sản phẩm
exports.createProductForm = (req, res) => { /* ... logic fetch categories ... */
    Category.findAll()
        .then(categories => { res.render("admin/products/create", { title: "Thêm mới Sản phẩm", categories: categories }); })
        .catch(err => { logger.error({ err }, "Lỗi khi lấy danh sách danh mục."); res.status(500).render("user/errorPage", { title: "Lỗi Database", message: err.message || "Lỗi khi lấy danh sách danh mục." }); });
};

// Xử lý submit form thêm mới sản phẩm (POST)
exports.createProductProcess = (req, res) => {
    const { error, value } = productSchema.validate(req.body, { abortEarly: false });
    if (error) {
        logger.warn(`Validation failed for product creation: ${error.details.map(x => x.message).join(', ')}`);
        return res.redirect(`/admin/products/create?error=${error.details[0].message}`);
    }
    Product.create(value)
        .then(data => { logger.info(`Product created: ${data.name}`); res.redirect("/admin/products?success=Thêm sản phẩm thành công!"); })
        .catch(err => { logger.error({ err }, "Lỗi khi tạo sản phẩm."); res.redirect(`/admin/products/create?error=${err.message || "Lỗi khi tạo sản phẩm."}`); });
};

// Render form chỉnh sửa sản phẩm
exports.editProductForm = (req, res) => { /* ... logic fetch product and categories ... */
    const id = req.params.productId;
    Promise.all([ Product.findByPk(id, { include: ['category'] }), Category.findAll() ])
    .then(([product, categories]) => {
        if (product) { res.render("admin/products/edit", { title: "Chỉnh sửa Sản phẩm", product: product, categories: categories }); }
        else { logger.warn(`Product not found for edit: ${id}`); res.status(404).render("user/errorPage", { title: "Không tìm thấy", message: `Không tìm thấy sản phẩm với id=${id}.` }); }
    })
    .catch(err => { logger.error({ err }, `Lỗi khi lấy thông tin sản phẩm ${id} hoặc danh mục.`); res.status(500).render("user/errorPage", { title: "Lỗi Database", message: "Lỗi khi lấy thông tin sản phẩm/danh mục: " + err.message }); });
};

// Xử lý submit form chỉnh sửa sản phẩm (POST với method-override PUT)
exports.updateProductProcess = (req, res) => {
    const id = req.params.productId;
    const { error, value } = productSchema.validate(req.body, { abortEarly: false });
    if (error) {
        logger.warn(`Validation failed for product update (${id}): ${error.details.map(x => x.message).join(', ')}`);
        return res.redirect(`/admin/products/edit/${id}?error=${error.details[0].message}`);
    }
    Product.update(value, { where: { id: id } })
        .then(num => {
            if (num[0] === 1) { logger.info(`Product updated: ${id}`); res.redirect("/admin/products?success=Cập nhật sản phẩm thành công!"); }
            else { logger.warn(`Product not found or no changes for update: ${id}`); res.redirect(`/admin/products/edit/${id}?error=Không tìm thấy hoặc không có gì để cập nhật.`); }
        })
        .catch(err => { logger.error({ err }, `Lỗi khi cập nhật sản phẩm ${id}.`); res.redirect(`/admin/products/edit/${id}?error=${err.message || "Lỗi khi cập nhật sản phẩm."}`); });
};

// Xử lý request xóa sản phẩm (POST với method-override DELETE)
exports.deleteProductProcess = (req, res) => {
     const id = req.params.productId;
    Product.destroy({ where: { id: id } })
        .then(num => {
            if (num === 1) { logger.info(`Product deleted: ${id}`); res.redirect("/admin/products?success=Xóa sản phẩm thành công!"); }
            else { logger.warn(`Product not found for deletion: ${id}`); res.redirect("/admin/products?error=Không tìm thấy sản phẩm để xóa."); }
        })
        .catch(err => { logger.error({ err }, `Lỗi khi xóa sản phẩm ${id}.`); res.redirect(`/admin/products?error=${err.message || "Lỗi khi xóa sản phẩm."}`); });
};