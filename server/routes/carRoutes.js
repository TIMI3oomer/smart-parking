const express = require("express");
const router = express.Router();

const {getAllCars,getCarByPlate,updateCar,deleteCar,createCar} =require("../controllers/carController");
const { create } = require("node:domain");

router.get("/",getAllCars);
router.get("/plate/:plate",getCarByPlate);

router.post("/",createCar);

router.put("/:id",updateCar);

router.delete("/:id",deleteCar);

module.exports= router;