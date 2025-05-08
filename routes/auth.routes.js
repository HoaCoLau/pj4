const express = require("express");
const controller = require("../controllers/auth.controller.js"); // Đảm bảo đường dẫn đúng
const { checkDuplicateEmail } = require("../middleware/verifySignUp"); // Đảm bảo đường dẫn đúng

const router = express.Router();

// Routes cho Views xác thực
// Đảm bảo các hàm controller được export và import đúng
router.get("/signup", controller.signupView);
router.get("/signin", controller.signinView);

// Routes xử lý form submit
router.post("/signup", checkDuplicateEmail, controller.signupProcess);
router.post("/signin", controller.signinProcess);
router.get("/signout", controller.signout); // Hoặc dùng POST nếu muốn an toàn hơn

module.exports = router;
