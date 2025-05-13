// controllers/admin/productController.js
const db = require('../../models');
const Product = db.product;
const Category = db.category;
const { Op } = require('sequelize'); // Để dùng các toán tử query phức tạp nếu cần
const path = require('path');
const fs = require('fs'); // Để xóa file ảnh cũ
// const logger = require('../../config/logger'); // Nếu bạn đã cấu hình pino riêng
const Joi = require('joi'); // Import Joi để validate input

// Schema validation cho sản phẩm
const productSchema = Joi.object({
    name: Joi.string().required().messages({'any.required': 'Tên sản phẩm là bắt buộc.'}),
    price: Joi.number().positive().required().messages({
        'any.required': 'Giá sản phẩm là bắt buộc.',
        'number.positive': 'Giá sản phẩm phải là số dương.'
    }),
    category_id: Joi.number().integer().positive().allow(null).messages({'number.positive': 'ID danh mục không hợp lệ.'}), // category_id có thể null
    description: Joi.string().allow('').optional(),
    stock_quantity: Joi.number().integer().min(0).required().messages({
         'any.required': 'Số lượng tồn kho là bắt buộc.',
         'number.integer': 'Số lượng tồn kho phải là số nguyên.',
         'number.min': 'Số lượng tồn kho không được âm.'
    }),
    // Không validate file upload ở đây, Multer đã xử lý
});


// Hiển thị danh sách sản phẩm (Admin)
exports.index = async (req, res) => {
  try {
    const products = await Product.findAll({
        include: Category, // Lấy cả thông tin category
        order: [['id', 'DESC']] // Sắp xếp theo ID mới nhất lên đầu
    });
    res.render('admin/products/index', {
        title: 'Quản lý Sản phẩm',
        products,
        success: req.query.success, // Lấy thông báo từ redirect
        error: req.query.error // Lấy thông báo lỗi từ redirect
    });
  } catch (err) {
    console.error('Lỗi lấy danh sách sản phẩm:', err);
    // logger.error(`Admin Product Index Error: ${err.message}`);
    res.status(500).send('Lỗi máy chủ khi lấy danh sách sản phẩm.');
  }
};

// Hiển thị form thêm sản phẩm mới (Admin)
exports.create = async (req, res) => {
  try {
    const categories = await Category.findAll();
    res.render('admin/products/create', {
        title: 'Thêm Sản phẩm mới',
        categories,
        error: null,
        oldInput: {} // Để giữ lại dữ liệu đã nhập khi có lỗi validation
    });
  } catch (err) {
    console.error('Lỗi hiển thị form thêm sản phẩm:', err);
    // logger.error(`Admin Product Create Form Error: ${err.message}`);
    res.status(500).send('Lỗi máy chủ khi hiển thị form thêm sản phẩm.');
  }
};

// Xử lý thêm sản phẩm mới (Admin)
exports.store = async (req, res) => {
    const { error, value } = productSchema.validate(req.body, { abortEarly: false });

    // Xử lý file upload trước khi validate body (Multer đã làm)
    const image_url = req.file ? `/images/${req.file.filename}` : null;

    if (error) {
        // Xóa file ảnh đã upload nếu validation thất bại
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        const errors = error.details.map(detail => detail.message);
         const categories = await Category.findAll(); // Cần lấy lại danh mục cho form
        return res.render('admin/products/create', {
            title: 'Thêm Sản phẩm mới',
            categories,
            error: errors,
            oldInput: req.body
        });
    }

  try {
    const { name, price, category_id, description, stock_quantity } = value;

    // Kiểm tra category_id có tồn tại không nếu nó không null
    if (category_id !== null) {
        const category = await Category.findByPk(category_id);
        if (!category) {
            // Xóa file ảnh đã upload nếu category không hợp lệ
            if (req.file && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
             const categories = await Category.findAll();
             return res.render('admin/products/create', {
                 title: 'Thêm Sản phẩm mới',
                 categories,
                 error: ['Danh mục không hợp lệ.'],
                 oldInput: req.body
             });
        }
    }


    await Product.create({
      name,
      price,
      category_id,
      description,
      image_url, // Sử dụng đường dẫn ảnh đã xử lý từ Multer
      stock_quantity
    });

    // logger.info(`Admin created product: ${name}`);

    res.redirect('/admin/products?success=' + encodeURIComponent('Thêm sản phẩm thành công!'));

  } catch (err) {
    console.error('Lỗi khi thêm sản phẩm:', err);
     // logger.error(`Admin Product Store Error: ${err.message}`);
     // Xóa file ảnh nếu có lỗi xảy ra sau khi upload và xử lý
     if (req.file && fs.existsSync(req.file.path)) {
         fs.unlinkSync(req.file.path);
     }
     const categories = await Category.findAll();
    res.render('admin/products/create', {
        title: 'Thêm Sản phẩm mới',
        categories,
        error: ['Có lỗi xảy ra khi thêm sản phẩm. Vui lòng thử lại.'],
        oldInput: req.body
    });
  }
};

// Hiển thị form sửa sản phẩm (Admin)
exports.edit = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) {
             // logger.warn(`Admin Product Edit Form: Product ${req.params.id} not found.`);
            return res.status(404).send('Sản phẩm không tồn tại.');
        }
        const categories = await Category.findAll();
        res.render('admin/products/edit', {
            title: 'Sửa Sản phẩm',
            product,
            categories,
            error: null,
            oldInput: product.toJSON() // Dữ liệu cũ của sản phẩm
        });
    } catch (err) {
        console.error('Lỗi hiển thị form sửa sản phẩm:', err);
        // logger.error(`Admin Product Edit Form Error: ${err.message}`);
        res.status(500).send('Lỗi máy chủ khi hiển thị form sửa sản phẩm.');
    }
};

// Xử lý cập nhật sản phẩm (Admin)
exports.update = async (req, res) => {
    const { error, value } = productSchema.validate(req.body, { abortEarly: false });
    const productId = req.params.id;

    // Xử lý file upload trước
    const image_url_new = req.file ? `/images/${req.file.filename}` : null;

    if (error) {
         // Xóa file ảnh đã upload nếu validation thất bại
         if (req.file && fs.existsSync(req.file.path)) {
             fs.unlinkSync(req.file.path);
         }
        const errors = error.details.map(detail => detail.message);
         const product = await Product.findByPk(productId); // Cần lấy lại sản phẩm cũ để hiển thị form
         const categories = await Category.findAll();
         if (!product) { // Trường hợp hiếm xảy ra nếu ID bị xóa giữa chừng
             return res.status(404).send('Sản phẩm không tồn tại.');
         }
        return res.render('admin/products/edit', {
            title: 'Sửa Sản phẩm',
            product,
            categories,
            error: errors
        });
    }

    try {
        const product = await Product.findByPk(productId);
        if (!product) {
             // Xóa file ảnh mới nếu có upload nhưng sản phẩm không tồn tại
             if (req.file && fs.existsSync(req.file.path)) {
                 fs.unlinkSync(req.file.path);
             }
             // logger.warn(`Admin Product Update: Product ${productId} not found.`);
            return res.status(404).send('Sản phẩm không tồn tại.');
        }

        const { name, price, category_id, description, stock_quantity } = value;
        let final_image_url = product.image_url; // Giữ lại ảnh cũ mặc định

        // Kiểm tra category_id có tồn tại không nếu nó không null
        if (category_id !== null) {
             const category = await Category.findByPk(category_id);
             if (!category) {
                  if (req.file && fs.existsSync(req.file.path)) {
                      fs.unlinkSync(req.file.path); // Xóa ảnh mới nếu category không hợp lệ
                  }
                  const categories = await Category.findAll();
                  return res.render('admin/products/edit', {
                      title: 'Sửa Sản phẩm',
                      product, // Trả về dữ liệu sản phẩm cũ
                      categories,
                      error: ['Danh mục không hợp lệ.']
                  });
              }
        }


        // Xử lý upload ảnh mới
        if (image_url_new) {
            // Xóa ảnh cũ nếu có và không phải ảnh mặc định
            if (product.image_url && product.image_url !== image_url_new) { // So sánh để tránh xóa nhầm nếu update lại ảnh cũ với tên mới (trường hợp hiếm)
                const oldImagePath = path.join(__dirname, '../../public', product.image_url);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                    // logger.info(`Deleted old product image: ${oldImagePath}`);
                }
            }
            final_image_url = image_url_new;
        }


        await product.update({
            name,
            price,
            category_id,
            description,
            image_url: final_image_url,
            stock_quantity
        });

        // logger.info(`Admin updated product: ${productId}`);

        res.redirect('/admin/products?success=' + encodeURIComponent('Cập nhật sản phẩm thành công!'));

    } catch (err) {
        console.error('Lỗi khi cập nhật sản phẩm:', err);
         // logger.error(`Admin Product Update Error: ${err.message}`);
         // Xóa file ảnh mới nếu có lỗi xảy ra sau khi upload và xử lý
         if (req.file && fs.existsSync(req.file.path)) {
             fs.unlinkSync(req.file.path);
         }
         const product = await Product.findByPk(productId); // Lấy lại dữ liệu sản phẩm để hiển thị form
         const categories = await Category.findAll();
         if (!product) { // Trường hợp hiếm xảy ra nếu ID bị xóa giữa chừng
              return res.status(404).send('Sản phẩm không tồn tại.');
          }
         res.render('admin/products/edit', {
             title: 'Sửa Sản phẩm',
             product,
             categories,
             error: ['Có lỗi xảy ra khi cập nhật sản phẩm. Vui lòng thử lại.']
         });
    }
};

// Xử lý xóa sản phẩm (Admin)
exports.delete = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) {
             // logger.warn(`Admin Product Delete: Product ${req.params.id} not found.`);
             return res.redirect('/admin/products?error=' + encodeURIComponent('Sản phẩm không tồn tại.'));
        }

        // Xóa file ảnh liên quan nếu có và không phải null
        if (product.image_url) {
             const imagePath = path.join(__dirname, '../../public', product.image_url);
             if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
                 // logger.info(`Deleted product image during deletion: ${imagePath}`);
             }
        }

        await product.destroy();

        // logger.info(`Admin deleted product: ${req.params.id}`);

        res.redirect('/admin/products?success=' + encodeURIComponent('Xóa sản phẩm thành công!'));

    } catch (err) {
        console.error('Lỗi khi xóa sản phẩm:', err);
        // logger.error(`Admin Product Delete Error: ${err.message}`);
         res.redirect('/admin/products?error=' + encodeURIComponent('Có lỗi xảy ra khi xóa sản phẩm.'));
    }
};