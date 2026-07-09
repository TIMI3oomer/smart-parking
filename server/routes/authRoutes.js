const express =("express");
const router = express.Router();

const{login}=require("../controllers/authController");

router.post("/login",login);

module.exports = router ;