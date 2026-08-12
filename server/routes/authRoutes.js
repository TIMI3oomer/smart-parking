const express = require("express");
const router = express.Router();

const {
    login,
    register,
    requestPhoneVerification,
    verifyPhoneCode,
} = require("../controllers/authController");

router.post("/login", login);
router.post("/register/request-phone-verification", requestPhoneVerification);
router.post("/register/verify-phone", verifyPhoneCode);
router.post("/register", register);

module.exports = router;