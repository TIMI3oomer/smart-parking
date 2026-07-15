const mongoose = require("mongoose");
const Slot = require("../models/ParkingSlot");

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const handleServerError = (res, error, fallback = "Something went wrong") => {
    console.error(error);
    if (error.name === "CastError") {
        return res.status(400).json({ message: "Invalid id format" });
    }
    if (error.name === "ValidationError") {
        return res.status(400).json({ message: "Invalid input" });
    }
    return res.status(500).json({ message: fallback });
};

const normalizeCreatePayload = (payload = {}) => {
    const normalized = {
        slotNumber: payload.slotNumber,
        status: payload.status,
    };

    if (payload.floor !== undefined && payload.floor !== null && payload.floor !== "") {
        const floorNumber = Number(payload.floor);
        if (Number.isInteger(floorNumber) && floorNumber >= 1) {
            normalized.floor = floorNumber;
        }
    }

    if (typeof payload.currentCar === "string") {
        const trimmedCurrentCar = payload.currentCar.trim();
        if (trimmedCurrentCar) normalized.currentCar = trimmedCurrentCar;
    } else if (payload.currentCar) {
        normalized.currentCar = payload.currentCar;
    }

    if (typeof payload.reservedFor === "string") {
        const trimmedReservedFor = payload.reservedFor.trim();
        if (trimmedReservedFor) normalized.reservedFor = trimmedReservedFor;
    } else if (payload.reservedFor) {
        normalized.reservedFor = payload.reservedFor;
    }

    return normalized;
};

const normalizeUpdatePayload = (payload = {}) => {
    const update = {};
    const unset = {};

    if (Object.prototype.hasOwnProperty.call(payload, "slotNumber")) {
        update.slotNumber = payload.slotNumber;
    }
    if (Object.prototype.hasOwnProperty.call(payload, "status")) {
        update.status = payload.status;
    }
    if (Object.prototype.hasOwnProperty.call(payload, "floor")) {
        const floorNumber = Number(payload.floor);
        if (Number.isInteger(floorNumber) && floorNumber >= 1) {
            update.floor = floorNumber;
        }
    }
    if (Object.prototype.hasOwnProperty.call(payload, "currentCar")) {
        if (typeof payload.currentCar === "string") {
            const trimmedCurrentCar = payload.currentCar.trim();
            if (trimmedCurrentCar) {
                update.currentCar = trimmedCurrentCar;
            } else {
                unset.currentCar = "";
            }
        } else if (payload.currentCar) {
            update.currentCar = payload.currentCar;
        } else {
            unset.currentCar = "";
        }
    }
    if (Object.prototype.hasOwnProperty.call(payload, "reservedFor")) {
        if (typeof payload.reservedFor === "string") {
            const trimmedReservedFor = payload.reservedFor.trim();
            if (trimmedReservedFor) {
                update.reservedFor = trimmedReservedFor;
            } else {
                unset.reservedFor = "";
            }
        } else if (payload.reservedFor) {
            update.reservedFor = payload.reservedFor;
        } else {
            unset.reservedFor = "";
        }
    }

    const normalized = {};
    if (Object.keys(update).length) normalized.$set = update;
    if (Object.keys(unset).length) normalized.$unset = unset;

    return normalized;
};

const getAllSlots = async (req, res) => {
    try {
        const slots = await Slot.find()
            .populate({
                path: "currentCar",
                populate: { path: "owner", select: "name Phone" },
            })
            .populate("reservedFor", "name Phone");
        res.json(slots);
    } catch (error) {
        handleServerError(res, error, "Failed to load slots");
    }
};

const getSlotById = async (req, res) => {
    try {
        if (!isValidId(req.params.id)) {
            return res.status(400).json({ message: "Invalid slot id" });
        }

        const slot = await Slot.findById(req.params.id)
            .populate({
                path: "currentCar",
                populate: { path: "owner", select: "name Phone" },
            })
            .populate("reservedFor", "name Phone");

        if (!slot) {
            return res.status(404).json({ message: "slot not found" });
        }
        res.json(slot);
    } catch (error) {
        handleServerError(res, error, "Failed to load slot");
    }
};

const createSlot = async (req, res) => {
    try {
        const payload = normalizeCreatePayload(req.body);

        if (!payload.slotNumber || typeof payload.slotNumber !== "string") {
            return res.status(400).json({ message: "slotNumber is required" });
        }
        if (payload.currentCar && !isValidId(payload.currentCar)) {
            return res.status(400).json({ message: "Invalid currentCar id" });
        }
        if (payload.reservedFor && !isValidId(payload.reservedFor)) {
            return res.status(400).json({ message: "Invalid reservedFor id" });
        }

        const slot = new Slot(payload);
        await slot.save();
        res.status(201).json(slot);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ message: "A slot with that number already exists" });
        }
        handleServerError(res, error, "Could not create slot");
    }
};

const updateSlot = async (req, res) => {
    try {
        const isAdmin = req.user.role === "admin";

        if (!isAdmin) {
            return res.status(403).json({ message: "Admins only" });
        }
        if (!isValidId(req.params.id)) {            return res.status(400).json({ message: "Invalid slot id" });
        }

        const updatePayload = normalizeUpdatePayload(req.body);

        if (!updatePayload.$set && !updatePayload.$unset) {
            return res.status(400).json({ message: "No fields to update" });
        }

        const slot = await Slot.findByIdAndUpdate(
            req.params.id,
            updatePayload,
            { new: true, runValidators: true }
        ).populate({
            path: "currentCar",
            populate: { path: "owner", select: "name Phone" },
        });

        if (!slot) {
            return res.status(404).json({ message: "slot not found" });
        }
        res.json(slot);
    } catch (error) {
        handleServerError(res, error, "Could not update slot");
    }
};

const reserveSlot = async (req, res) => {
    try {
        if (!isValidId(req.params.id)) {
            return res.status(400).json({ message: "Invalid slot id" });
        }

        const slot = await Slot.findById(req.params.id);

        if (!slot) {
            return res.status(404).json({ message: "slot not found" });
        }

        if (slot.status !== "empty") {
            return res.status(400).json({ message: "Slot is not available" });
        }

        slot.status = "reserved";
        slot.reservedFor = req.user.id;
        await slot.save();

        const populatedSlot = await Slot.findById(slot._id)
            .populate({
                path: "currentCar",
                populate: { path: "owner", select: "name Phone" },
            })
            .populate("reservedFor", "name Phone");

        res.json(populatedSlot);
    } catch (error) {
        handleServerError(res, error, "Could not reserve slot");
    }
};

const assignCarToSlot = async (req, res) => {
    try {
        const { carId } = req.body;

        if (!carId || !isValidId(carId)) {
            return res.status(400).json({ message: "A valid carId is required" });
        }
        if (!isValidId(req.params.id)) {
            return res.status(400).json({ message: "Invalid slot id" });
        }

        // FIX: previously a car could be assigned to multiple slots at
        // once, since nothing checked whether it was already parked
        // somewhere else.
        const alreadyParkedElsewhere = await Slot.findOne({
            currentCar: carId,
            _id: { $ne: req.params.id },
        });
        if (alreadyParkedElsewhere) {
            return res.status(409).json({
                message: `That car is already assigned to slot ${alreadyParkedElsewhere.slotNumber}`,
            });
        }

        const slot = await Slot.findByIdAndUpdate(
            req.params.id,
            { $set: { currentCar: carId, status: "occupied" } },
            { new: true, runValidators: true }
        ).populate({
            path: "currentCar",
            populate: { path: "owner", select: "name Phone" },
        });

        if (!slot) {
            return res.status(404).json({ message: "slot not found" });
        }
        res.json(slot);
    } catch (error) {
        handleServerError(res, error, "Could not assign car");
    }
};

const freeSlot = async (req, res) => {
    try {
        if (!isValidId(req.params.id)) {
            return res.status(400).json({ message: "Invalid slot id" });
        }

        // FIX: populate currentCar's owner so we can check ownership of
        // an assigned car, not just a reservation.
        const slot = await Slot.findById(req.params.id).populate({
            path: "currentCar",
            select: "owner",
        });

        if (!slot) {
            return res.status(404).json({ message: "slot not found" });
        }

        const isAdmin = req.user.role === "admin";
        const isReservedByMe = slot.reservedFor?.toString() === req.user.id;
        // FIX: previously only `reservedFor` was checked, so a user whose
        // car had been *assigned* by an admin (which never sets
        // reservedFor) could never free their own slot — the API always
        // returned 403 for them.
        const isMyAssignedCar = slot.currentCar?.owner?.toString() === req.user.id;

        if (!isAdmin && !isReservedByMe && !isMyAssignedCar) {
            return res.status(403).json({ message: "You can only free your own slot" });
        }

        slot.status = "empty";
        slot.currentCar = null;
        slot.reservedFor = null;
        await slot.save();

        const populatedSlot = await Slot.findById(slot._id)
            .populate({
                path: "currentCar",
                populate: { path: "owner", select: "name Phone" },
            })
            .populate("reservedFor", "name Phone");

        res.json(populatedSlot);
    } catch (error) {
        handleServerError(res, error, "Could not free slot");
    }
};

const deleteSlot = async (req, res) => {
    try {
        if (!isValidId(req.params.id)) {
            return res.status(400).json({ message: "Invalid slot id" });
        }

        const slot = await Slot.findByIdAndDelete(req.params.id);

        if (!slot) {
            return res.status(404).json({ message: "slot not found" });
        }
        res.json({ message: "slot deleted successfully" });
    } catch (error) {
        handleServerError(res, error, "Could not delete slot");
    }
};

module.exports = {
    getAllSlots,
    getSlotById,
    createSlot,
    updateSlot,
    reserveSlot,
    assignCarToSlot,
    freeSlot,
    deleteSlot,
};