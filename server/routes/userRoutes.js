const express = require("express");
const router = express.Router();

const { getAllUsers, getUserByPhone, deleteUser, updateUser, createUser } =
    require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");
const { requireAdmin } = require("../middleware/roleMiddleware");

router.get("/", protect, requireAdmin, getAllUsers);

router.get("/Phone/:Phone", protect, requireAdmin, getUserByPhone);

router.put("/:id", protect, updateUser);

router.post("/", createUser);

router.delete("/:id", protect, requireAdmin, deleteUser);

module.exports = router;