const express = require("express");
const router = express.Router();

const {
    getAllSlots,
    getSlotById,
    assignCarToSlot,
    freeSlot,
    reserveSlot,
    occupySlot,
} = require("../controllers/slotController");
const { protect } = require("../middleware/authMiddleware");
const { requireAdmin } = require("../middleware/roleMiddleware");

router.get("/", protect, getAllSlots);
router.get("/:id", protect, getSlotById);

router.put("/:id/reserve", protect, requireAdmin, reserveSlot);
router.put("/:id/occupy", protect, occupySlot);
router.put("/:id/assign", protect, requireAdmin, assignCarToSlot);
router.put("/:id/free", protect, freeSlot);

module.exports = router;
