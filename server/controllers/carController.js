const mongoose = require("mongoose");
const Car = require("../models/Car");
const User = require("../models/User");
const Slot = require("../models/ParkingSlot");

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const handleServerError = (res, error, fallback = "Something went wrong") => {
    console.error(error);
    if (error.code === 11000) {
        return res.status(409).json({ message: "A car with that plate already exists" });
    }
    if (error.name === "CastError") {
        return res.status(400).json({ message: "Invalid id format" });
    }
    if (error.name === "ValidationError") {
        return res.status(400).json({ message: "Invalid input" });
    }
    return res.status(500).json({ message: fallback });
};

const getAllCars = async (req, res) => {
    try {
        const cars = await Car.find().populate("owner", "name Phone");
        res.json(cars);
    } catch (error) {
        handleServerError(res, error, "Failed to load cars");
    }
};

const getCarByPlate = async (req, res) => {
    try {
        const car = await Car.findOne({ plate: req.params.plate }).populate("owner", "name Phone");
        if (!car) {
            return res.status(404).json({ message: "car not found" });
        }
        res.json(car);
    } catch (error) {
        handleServerError(res, error, "Failed to load car");
    }
};

const createCar = async (req, res) => {
    try {
        const { model, plate, color, owner } = req.body;

        if (!model || !plate || !owner) {
            return res.status(400).json({ message: "model, plate, and owner are required" });
        }
        if (!isValidId(owner)) {
            return res.status(400).json({ message: "Invalid owner id" });
        }

        const ownerExists = await User.exists({ _id: owner });
        if (!ownerExists) {
            return res.status(404).json({ message: "owner user not found" });
        }

        const car = new Car({
            model: String(model).trim(),
            plate: String(plate).trim().toUpperCase(),
            color: color ? String(color).trim() : undefined,
            owner,
        });
        await car.save();

        const populated = await car.populate("owner", "name Phone");
        res.status(201).json(populated);
    } catch (error) {
        handleServerError(res, error, "Could not create car");
    }
};

const updateCar = async (req, res) => {
    try {
        if (!isValidId(req.params.id)) {
            return res.status(400).json({ message: "Invalid car id" });
        }

        const update = {};
        if (req.body.model) update.model = String(req.body.model).trim();
        if (req.body.plate) update.plate = String(req.body.plate).trim().toUpperCase();
        if (req.body.color) update.color = String(req.body.color).trim();
        if (req.body.owner) {
            if (!isValidId(req.body.owner)) {
                return res.status(400).json({ message: "Invalid owner id" });
            }
            const ownerExists = await User.exists({ _id: req.body.owner });
            if (!ownerExists) {
                return res.status(404).json({ message: "owner user not found" });
            }
            update.owner = req.body.owner;
        }

        if (Object.keys(update).length === 0) {
            return res.status(400).json({ message: "No valid fields to update" });
        }

        const car = await Car.findByIdAndUpdate(req.params.id, update, {
            new: true,
            runValidators: true,
        }).populate("owner", "name Phone");

        if (!car) {
            return res.status(404).json({ message: "car not found" });
        }
        res.json(car);
    } catch (error) {
        handleServerError(res, error, "Could not update car");
    }
};

const deleteCar = async (req, res) => {
    try {
        if (!isValidId(req.params.id)) {
            return res.status(400).json({ message: "Invalid car id" });
        }
        const parkedIn = await Slot.findOne({ currentCar: req.params.id });
        if (parkedIn) {
            return res.status(409).json({
                message: `Free slot ${parkedIn.slotNumber} before deleting this car`,
            });
        }

        const car = await Car.findByIdAndDelete(req.params.id);
        if (!car) {
            return res.status(404).json({ message: "car not found" });
        }
        res.json({ message: "car deleted successfully" });
    } catch (error) {
        handleServerError(res, error, "Could not delete car");
    }
};

module.exports = { getAllCars, getCarByPlate, updateCar, deleteCar, createCar };