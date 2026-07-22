const express = require("express");
const router = express.Router();

const {
    getAllSlots,
    getSlotById,
    updateSlot,
    deleteSlot,
    createSlot,
    assignCarToSlot,
    freeSlot,
    reserveSlot,
    occupySlot,
} = require("../controllers/slotController");
const { protect } = require("../middleware/authMiddleware");
const { requireAdmin } = require("../middleware/roleMiddleware");

router.get("/:id", protect, getSlotById);
router.get("/", protect, getAllSlots);

router.post("/", protect, requireAdmin, createSlot);

router.put("/:id", protect, requireAdmin, updateSlot);
router.put("/:id/reserve", protect, requireAdmin, reserveSlot);
router.put("/:id/occupy", protect, occupySlot);
router.put("/:id/assign", protect, requireAdmin, assignCarToSlot);
router.put("/:id/free", protect, freeSlot);

router.delete("/:id", protect, requireAdmin, deleteSlot);

module.exports = router;