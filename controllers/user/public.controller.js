const db = require("../../models");
const Product = db.products;
const Category = db.categories;
const Op = db.Op;
const logger = require('../../config/logger');

exports.home = (req, res) => {
    req.log.info('Rendering public home page');
    Promise.all([
        // Sửa lỗi: Sắp xếp theo 'created_at' thay vì 'createdAt'
        Product.findAll({ limit: 8, order: [['created_at', 'DESC']] }),
        Category.findAll()
    ])
    .then(([latestProducts, categories]) => {
        res.render("user/home", {
            title: "Trang chủ",
            latestProducts: latestProducts,
            categories: categories,
        });
    })
    .catch(err => {
         req.log.error({ err }, "Lỗi khi tải trang chủ.");
         res.status(500).render("user/errorPage", { title: "Lỗi Server", message: err.message || "Đã xảy ra lỗi khi tải trang chủ." });
    });
};

exports.listProducts = (req, res) => {
    req.log.info('Rendering public product list');
    const { name, categoryId } = req.query;
    const condition = {};
    if (name) condition.name = { [Op.like]: `%${name}%` };
    if (categoryId) condition.category_id = categoryId;

    Product.findAll({
        where: condition,
        include: ['category'],
        // Thêm sắp xếp mặc định nếu cần, sử dụng tên cột chính xác
        // order: [['name', 'ASC']]
    })
    .then(data => {
         Category.findAll().then(categories => {
            res.render("user/products/index", {
                title: "Danh sách Sản phẩm",
                products: data,
                categories: categories,
                selectedCategoryId: categoryId || '',
                searchTerm: name || '',
            });
         }).catch(err => {
             req.log.error({ err }, "Lỗi khi lấy danh sách danh mục.");
             res.status(500).render("user/errorPage", { title: "Lỗi Database", message: err.message || "Lỗi khi lấy danh sách danh mục." });
         });
    })
    .catch(err => {
      req.log.error({ err }, "Lỗi khi lấy danh sách sản phẩm.");
      res.status(500).render("user/errorPage", { title: "Lỗi Database", message: err.message || "Đã xảy ra lỗi khi lấy danh sách sản phẩm." });
    });
};

exports.productDetail = (req, res) => {
     const id = req.params.productId;
     req.log.info(`Rendering public product detail for ID: ${id}`);
     Product.findByPk(id, { include: ['category'] })
        .then(data => {
             if (data) {
                res.render("user/products/detail", {
                    title: data.name,
                    product: data,
                });
             } else {
                req.log.warn(`Product not found for detail view: ${id}`);
                res.status(404).render("user/errorPage", { title: "Không tìm thấy", message: `Không tìm thấy sản phẩm với id=${id}.` });
             }
        })
        .catch(err => {
             req.log.error({ err }, `Lỗi khi lấy thông tin sản phẩm ${id}.`);
             res.status(500).render("user/errorPage", { title: "Lỗi Database", message: "Lỗi khi lấy thông tin sản phẩm: " + err.message });
        });
};

exports.listCategories = (req, res) => {
     req.log.info('Rendering public category list');
     Category.findAll()
        .then(data => {
            res.render("user/categories/index", {
                title: "Danh mục Sản phẩm",
                categories: data,
            });
        })
        .catch(err => {
            req.log.error({ err }, "Lỗi khi lấy danh mục sản phẩm.");
            res.status(500).render("user/errorPage", { title: "Lỗi Database", message: err.message || "Lỗi khi lấy danh mục sản phẩm." });
        });
};
