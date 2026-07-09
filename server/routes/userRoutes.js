const express =require("express");
const router =express.Router();

const{getAllUsers,getUserByPhone,deleteUser,updateUser,createUser}= require("../controllers/userController");

router.get("/",getAllUsers);
router.get("/Phone/:Phone",getUserByPhone);

router.put("/:id",updateUser);

router.post("/",createUser);

router.delete("/:id",deleteUser)

module.exports = router ;