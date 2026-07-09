const express = require("express");
const router = express.Router();

const {getAllCars,getCarByPlate,updateCar,deleteCar,createCar} =require("../controllers/carController");
const { create } = require("node:domain");
const { protect } = require("../middleware/authMiddleware");
const { requireAdmin } = require("../middleware/roleMiddleware");

router.get("/",protect,getAllCars);

router.get("/plate/:plate",protect,getCarByPlate);

router.post("/",protect,requireAdmin,createCar);

router.put("/:id",protect,requireAdmin,updateCar);

router.delete("/:id",protect,requireAdmin,deleteCar);

module.exports= router;