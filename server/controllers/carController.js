const Car = require("../models/Car");

const normalizeCreatePayload = (payload = {}) => {
    const normalized = {
        type: payload.type,
        plate: payload.plate,
        color: payload.color,
        photo: payload.photo,
    };

    if (typeof payload.owner === "string") {
        const trimmedOwner = payload.owner.trim();
        if (trimmedOwner) normalized.owner = trimmedOwner;
    } else if (payload.owner) {
        normalized.owner = payload.owner;
    }

    return normalized;
};

const normalizeUpdatePayload = (payload = {}) => {
    const update = {};
    const unset = {};

    if (Object.prototype.hasOwnProperty.call(payload, "type")) {
        update.type = payload.type;
    }
    if (Object.prototype.hasOwnProperty.call(payload, "plate")) {
        update.plate = payload.plate;
    }
    if (Object.prototype.hasOwnProperty.call(payload, "color")) {
        update.color = payload.color;
    }
    if (Object.prototype.hasOwnProperty.call(payload, "photo")) {
        update.photo = payload.photo;
    }
    if (Object.prototype.hasOwnProperty.call(payload, "owner")) {
        if (typeof payload.owner === "string") {
            const trimmedOwner = payload.owner.trim();
            if (trimmedOwner) {
                update.owner = trimmedOwner;
            } else {
                unset.owner = "";
            }
        } else if (payload.owner) {
            update.owner = payload.owner;
        } else {
            unset.owner = "";
        }
    }

    const normalized = {};
    if (Object.keys(update).length) normalized.$set = update;
    if (Object.keys(unset).length) normalized.$unset = unset;

    return normalized;
};

const getAllCars = async (req, res) => {
    try {
        const cars = await Car.find().populate("owner", "name Phone");
        res.json(cars);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createCar = async (req, res) => {
    try {
        const car = new Car(normalizeCreatePayload(req.body));
        await car.save();
        res.status(201).json(car);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateCar = async (req, res) => {
    try {
        const isOwner = req.user.id === req.params.id;
        const isAdmin = req.user.role === "admin";

        if (!isOwner && !isAdmin) {
            return res.status(403).json({ message: "You can only update your own profile" });
        }

        const updatePayload = normalizeUpdatePayload(req.body);

        if (!updatePayload.$set && !updatePayload.$unset) {
            return res.status(400).json({ message: "No fields to update" });
        }

        const car = await Car.findByIdAndUpdate(
            req.params.id,
            updatePayload,
            { new: true }
        ).populate("owner", "name Phone");

        if (!car) {
            return res.status(404).json({ message: "car not found" });
        }
        res.json(car);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteCar = async (req, res) => {
    try {
        const car = await Car.findByIdAndDelete(req.params.id);

        if (!car) {
            return res.status(404).json({ message: "car not found" });
        }
        res.json({ message: "car deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getCarByPlate = async (req, res) => {
    try {
        const { plate } = req.params;

        const car = await Car.findOne({ plate }).populate("owner", "name Phone");
        if (!car) {
            return res.status(404).json({ message: "Car not found" });
        }
        res.status(200).json(car);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllCars,
    getCarByPlate,
    createCar,
    updateCar,
    deleteCar,
};