const express = require("express");
const router = express.Router();

const {
    getAllSlots,
    getSlotById,
    assignCarToSlot,
    freeSlot,
    occupySlot,
} = require("../controllers/slotController");
const { protect } = require("../middleware/authMiddleware");
const { requireAdmin } = require("../middleware/roleMiddleware");
const { requireOfficeNetwork } = require("../middleware/officeNetworkMiddleware");

router.get("/", protect, getAllSlots);
router.get("/:id", protect, getSlotById);

router.put("/:id/occupy", protect, requireOfficeNetwork, occupySlot);
router.put("/:id/assign", protect, requireAdmin, assignCarToSlot);
router.put("/:id/free", protect, freeSlot);

module.exports = router;
