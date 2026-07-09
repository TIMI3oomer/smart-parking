const express = require("express");
const router =express.Router();

const{getAllSlots,getSlotById,updateSlot,deleteSlot,createSlot,assignCarToSlot,freeSlot,}=require("../controllers/slotController");
const{protect}=require("../middleware/authMiddleware");
const{requireAdmin}=require("../middleware/roleMiddleware");

router.get("/:id",getSlotById);
router.get("/",protect,getAllSlots);


router.post("/",protect,requireAdmin,createSlot);

router.put("/:id",updateSlot);
router.put("/:id/assign",protect,requireAdmin, assignCarToSlot);
router.put("/:id/free",freeSlot);

router.delete("/:id",protect, deleteSlot);

module.exports=router;