const db = require("../../models");
const Product = db.products;
const Category = db.categories;
const Op = db.Op;
const logger = require('../../config/logger');

exports.home = async (req, res) => {
    req.log.info('Rendering public home page');
    try {
        const [latestProducts, categories] = await Promise.all([
            Product.findAll({ limit: 8, order: [['created_at', 'DESC']] }),
            Category.findAll()
        ]);
        res.render("user/home", { title: "Trang chủ", latestProducts: latestProducts, categories: categories });
    } catch (err) {
         req.log.error({ err }, "Lỗi khi tải trang chủ.");
         res.status(500).render("user/errorPage", { title: "Lỗi Server", message: err.message || "Đã xảy ra lỗi khi tải trang chủ." });
    }
};

exports.listProducts = async (req, res) => {
    req.log.info('Rendering public product list');
    const { name, categoryId } = req.query;
    const condition = {};
    if (name) condition.name = { [Op.like]: `%${name}%` };
    if (categoryId) condition.category_id = categoryId;

    try {
        const products = await Product.findAll({ where: condition, include: ['category'] });
        const categories = await Category.findAll();
        res.render("user/products/index", {
            title: "Danh sách Sản phẩm", products: products, categories: categories,
            selectedCategoryId: categoryId || '', searchTerm: name || '',
        });
    } catch (err) {
      req.log.error({ err }, "Lỗi khi lấy danh sách sản phẩm hoặc danh mục.");
      res.status(500).render("user/errorPage", { title: "Lỗi Database", message: err.message || "Đã xảy ra lỗi khi lấy danh sách sản phẩm." });
    }
};

exports.productDetail = async (req, res) => {
     const id = req.params.productId;
     req.log.info(`Rendering public product detail for ID: ${id}`);
     try {
       const data = await Product.findByPk(id, { include: ['category'] });
        if (data) { res.render("user/products/detail", { title: data.name, product: data }); }
        else { req.log.warn(`Product not found for detail view: ${id}`); res.status(404).render("user/errorPage", { title: "Không tìm thấy", message: `Không tìm thấy sản phẩm với id=${id}.` }); }
     } catch (err) {
         req.log.error({ err }, `Lỗi khi lấy thông tin sản phẩm ${id}.`);
         res.status(500).render("user/errorPage", { title: "Lỗi Database", message: "Lỗi khi lấy thông tin sản phẩm: " + err.message });
    }
};

exports.listCategories = async (req, res) => {
     req.log.info('Rendering public category list');
     try {
       const data = await Category.findAll();
        res.render("user/categories/index", { title: "Danh mục Sản phẩm", categories: data });
     } catch (err) {
         req.log.error({ err }, "Lỗi khi lấy danh mục sản phẩm.");
         res.status(500).render("user/errorPage", { title: "Lỗi Database", message: err.message || "Lỗi khi lấy danh mục sản phẩm." });
    }
};
