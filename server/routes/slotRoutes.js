const express = require("express");
const router =express.Router();

const{getAllSlots,getSlotById,updateSlot,deleteSlot,createSlot,assignCarToSlot,freeSlot,}=require("../controllers/slotController");

router.get("/",getAllSlots);
router.get("/:id",getSlotById);
router.post("/",createSlot);
router.put("/:id",updateSlot);
router.put("/:id/assign", assignCarToSlot);
router.put("/:id/free",freeSlot);
router.delete("/:id", deleteSlot);

module.exports=router;