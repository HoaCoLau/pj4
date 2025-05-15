    // routes/client/index.js
    const express = require('express');
    const router = express.Router();
    const homeController = require('../../controllers/client/homeController');
    const { authenticate , attachUserToLocals } = require('../../middleware/authMiddleware'); // Cần đăng nhập để xem giỏ hàng

// Áp dụng middleware xác thực cho tất cả route trong file này
router.use(authenticate);
router.use(attachUserToLocals);



    // Không cần áp dụng middleware nào ở đây nữa vì authenticate và attachUserToLocals đã chạy toàn cục


    // Routes cho public pages
    router.get('/', homeController.index);


    module.exports = router;
    