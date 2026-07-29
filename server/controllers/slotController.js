const mongoose = require("mongoose");
const Slot = require("../models/ParkingSlot");

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const handleServerError = (res, error, fallback = "حدث خطأ ما") => {
    console.error(error);
    if (error.name === "CastError") {
        return res.status(400).json({ message: "صيغة المعرف غير صالحة" });
    }
    if (error.name === "ValidationError") {
        return res.status(400).json({ message: "بيانات غير صالحة" });
    }
    return res.status(500).json({ message: fallback });
};

const populateSlot = (query) =>
    query
        .populate({
            path: "currentCar",
            populate: { path: "owner", select: "name Phone" },
        })
        .populate("reservedFor", "name Phone");

const getAllSlots = async (req, res) => {
    try {
        const slots = await populateSlot(Slot.find());
        res.json(slots);
    } catch (error) {
        handleServerError(res, error, "تعذر تحميل المواقف");
    }
};

const getSlotById = async (req, res) => {
    try {
        if (!isValidId(req.params.id)) {
            return res.status(400).json({ message: "معرف الموقف غير صالح" });
        }

        const slot = await populateSlot(Slot.findById(req.params.id));

        if (!slot) {
            return res.status(404).json({ message: "الموقف غير موجود" });
        }
        res.json(slot);
    } catch (error) {
        handleServerError(res, error, "تعذر تحميل الموقف");
    }
};

const reserveSlot = async (req, res) => {
    try {
        if (!isValidId(req.params.id)) {
            return res.status(400).json({ message: "معرف الموقف غير صالح" });
        }

        const slot = await Slot.findById(req.params.id);

        if (!slot) {
            return res.status(404).json({ message: "الموقف غير موجود" });
        }

        if (slot.status !== "empty") {
            return res.status(400).json({ message: "الموقف غير متاح" });
        }

        if (req.body.userId && !isValidId(req.body.userId)) {
            return res.status(400).json({ message: "معرف المستخدم غير صالح" });
        }

        slot.status = "reserved";
        slot.reservedFor = req.body.userId || req.user.id;
        await slot.save();

        res.json(await populateSlot(Slot.findById(slot._id)));
    } catch (error) {
        handleServerError(res, error, "تعذر حجز الموقف");
    }
};

const occupySlot = async (req, res) => {
    try {
        if (!isValidId(req.params.id)) {
            return res.status(400).json({ message: "معرف الموقف غير صالح" });
        }

        const slot = await Slot.findById(req.params.id);

        if (!slot) {
            return res.status(404).json({ message: "الموقف غير موجود" });
        }

        if (slot.status !== "empty") {
            return res.status(400).json({ message: "الموقف غير متاح" });
        }

        slot.status = "occupied";
        slot.reservedFor = req.user.id;
        await slot.save();

        res.json(await populateSlot(Slot.findById(slot._id)));
    } catch (error) {
        handleServerError(res, error, "تعذر إشغال الموقف");
    }
};

const assignCarToSlot = async (req, res) => {
    try {
        const { carId } = req.body;

        if (!carId || !isValidId(carId)) {
            return res.status(400).json({ message: "معرف سيارة صالح مطلوب" });
        }
        if (!isValidId(req.params.id)) {
            return res.status(400).json({ message: "معرف الموقف غير صالح" });
        }

        const alreadyParkedElsewhere = await Slot.findOne({
            currentCar: carId,
            _id: { $ne: req.params.id },
        });
        if (alreadyParkedElsewhere) {
            return res.status(409).json({
                message: `هذه السيارة معينة بالفعل للموقف ${alreadyParkedElsewhere.slotNumber}`,
            });
        }

        const slot = await populateSlot(
            Slot.findByIdAndUpdate(
                req.params.id,
                { $set: { currentCar: carId, status: "occupied" } },
                { new: true, runValidators: true }
            )
        );

        if (!slot) {
            return res.status(404).json({ message: "الموقف غير موجود" });
        }
        res.json(slot);
    } catch (error) {
        handleServerError(res, error, "تعذر تعيين السيارة");
    }
};

const freeSlot = async (req, res) => {
    try {
        if (!isValidId(req.params.id)) {
            return res.status(400).json({ message: "معرف الموقف غير صالح" });
        }

        const slot = await Slot.findById(req.params.id).populate({
            path: "currentCar",
            select: "owner",
        });

        if (!slot) {
            return res.status(404).json({ message: "الموقف غير موجود" });
        }

        const isAdmin = req.user.role === "admin";
        const isReservedByMe = slot.reservedFor?.toString() === req.user.id;
        const isMyAssignedCar = slot.currentCar?.owner?.toString() === req.user.id;

        if (!isAdmin && !isReservedByMe && !isMyAssignedCar) {
            return res.status(403).json({ message: "لا يمكنك إخلاء إلا موقفك الخاص" });
        }

        slot.status = "empty";
        slot.currentCar = null;
        slot.reservedFor = null;
        await slot.save();

        res.json(await populateSlot(Slot.findById(slot._id)));
    } catch (error) {
        handleServerError(res, error, "تعذر إخلاء الموقف");
    }
};

module.exports = {
    getAllSlots,
    getSlotById,
    reserveSlot,
    occupySlot,
    assignCarToSlot,
    freeSlot,
};
