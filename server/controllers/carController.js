const mongoose = require("mongoose");
const Car = require("../models/Car");
const User = require("../models/User");
const Slot = require("../models/ParkingSlot");

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const handleServerError = (res, error, fallback = "حدث خطأ ما") => {
    console.error(error);
    if (error.code === 11000) {
        return res.status(409).json({ message: "توجد سيارة بهذه اللوحة بالفعل" });
    }
    if (error.name === "CastError") {
        return res.status(400).json({ message: "صيغة المعرف غير صالحة" });
    }
    if (error.name === "ValidationError") {
        return res.status(400).json({ message: "بيانات غير صالحة" });
    }
    return res.status(500).json({ message: fallback });
};

const getAllCars = async (req, res) => {
    try {
        const cars = await Car.find().populate("owner", "name phone");
        res.json(cars);
    } catch (error) {
        handleServerError(res, error, "تعذر تحميل السيارات");
    }
};

const getCarByPlate = async (req, res) => {
    try {
        const car = await Car.findOne({ plate: req.params.plate }).populate("owner", "name phone");
        if (!car) {
            return res.status(404).json({ message: "السيارة غير موجودة" });
        }
        res.json(car);
    } catch (error) {
        handleServerError(res, error, "تعذر تحميل السيارة");
    }
};

const createCar = async (req, res) => {
    try {
        const { model, plate, color, owner } = req.body;

        if (!model || !plate || !owner) {
            return res.status(400).json({ message: "الطراز ورقم اللوحة والمالك مطلوبة" });
        }
        if (!isValidId(owner)) {
            return res.status(400).json({ message: "معرف المالك غير صالح" });
        }

        const ownerExists = await User.exists({ _id: owner });
        if (!ownerExists) {
            return res.status(404).json({ message: "المستخدم المالك غير موجود" });
        }

        // Each user is assumed to have exactly one car.
        const existingCarForOwner = await Car.findOne({ owner });
        if (existingCarForOwner) {
            return res.status(409).json({
                message: "هذا المستخدم لديه سيارة مسجلة بالفعل (سيارة واحدة لكل مستخدم)",
            });
        }

        const car = new Car({
            model: String(model).trim(),
            plate: String(plate).trim().toUpperCase(),
            color: color ? String(color).trim() : undefined,
            owner,
        });
        await car.save();
        await User.findByIdAndUpdate(owner, { car: car._id });

        const populated = await car.populate("owner", "name phone");
        res.status(201).json(populated);
    } catch (error) {
        handleServerError(res, error, "تعذر إنشاء السيارة");
    }
};

const updateCar = async (req, res) => {
    try {
        if (!isValidId(req.params.id)) {
            return res.status(400).json({ message: "معرف السيارة غير صالح" });
        }

        const update = {};
        if (req.body.model) update.model = String(req.body.model).trim();
        if (req.body.plate) update.plate = String(req.body.plate).trim().toUpperCase();
        if (req.body.color) update.color = String(req.body.color).trim();
        let previousOwner = null;
        if (req.body.owner) {
            if (!isValidId(req.body.owner)) {
                return res.status(400).json({ message: "معرف المالك غير صالح" });
            }
            const ownerExists = await User.exists({ _id: req.body.owner });
            if (!ownerExists) {
                return res.status(404).json({ message: "المستخدم المالك غير موجود" });
            }

            // Each user is assumed to have exactly one car, so block
            // transferring this car to a user who already has a different one.
            const existingCarForNewOwner = await Car.findOne({
                owner: req.body.owner,
                _id: { $ne: req.params.id },
            });
            if (existingCarForNewOwner) {
                return res.status(409).json({
                    message: "هذا المستخدم لديه سيارة مسجلة بالفعل (سيارة واحدة لكل مستخدم)",
                });
            }

            const currentCar = await Car.findById(req.params.id).select("owner");
            previousOwner = currentCar?.owner || null;
            update.owner = req.body.owner;
        }

        if (Object.keys(update).length === 0) {
            return res.status(400).json({ message: "لا توجد حقول صالحة للتحديث" });
        }

        const car = await Car.findByIdAndUpdate(req.params.id, update, {
            new: true,
            runValidators: true,
        }).populate("owner", "name phone");

        if (!car) {
            return res.status(404).json({ message: "السيارة غير موجودة" });
        }

        if (update.owner) {
            await User.findByIdAndUpdate(update.owner, { car: car._id });
            if (previousOwner && String(previousOwner) !== String(update.owner)) {
                await User.findByIdAndUpdate(previousOwner, { car: null });
            }
        }

        res.json(car);
    } catch (error) {
        handleServerError(res, error, "تعذر تحديث السيارة");
    }
};

const deleteCar = async (req, res) => {
    try {
        if (!isValidId(req.params.id)) {
            return res.status(400).json({ message: "معرف السيارة غير صالح" });
        }
        const parkedIn = await Slot.findOne({ currentCar: req.params.id });
        if (parkedIn) {
            return res.status(409).json({
                message: `يجب إخلاء الموقف ${parkedIn.slotNumber} قبل حذف هذه السيارة`,
            });
        }

        const car = await Car.findByIdAndDelete(req.params.id);
        if (!car) {
            return res.status(404).json({ message: "السيارة غير موجودة" });
        }
        await User.findByIdAndUpdate(car.owner, { car: null });
        res.json({ message: "تم حذف السيارة بنجاح" });
    } catch (error) {
        handleServerError(res, error, "تعذر حذف السيارة");
    }
};

module.exports = { getAllCars, getCarByPlate, updateCar, deleteCar, createCar };