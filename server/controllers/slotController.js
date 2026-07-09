const Slot = require("../models/ParkingSlot");

const normalizeCreatePayload = (payload = {}) => {
    const normalized = {
        slotNumber: payload.slotNumber,
        status: payload.status,
    };

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
        res.status(500).json({ message: error.message });
    }
};

const getSlotById = async (req, res) => {
    try {
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
        res.status(500).json({ message: error.message });
    }
};

const createSlot = async (req, res) => {
    try {
        const slot = new Slot(normalizeCreatePayload(req.body));
        await slot.save();
        res.status(201).json(slot);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateSlot = async (req, res) => {
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

        const slot = await Slot.findByIdAndUpdate(
            req.params.id,
            updatePayload,
            { new: true }
        ).populate({
            path: "currentCar",
            populate: { path: "owner", select: "name Phone" },
        });

        if (!slot) {
            return res.status(404).json({ message: "slot not found" });
        }
        res.json(slot);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const assignCarToSlot = async (req, res) => {
    try {
        const { carId } = req.body;

        if (!carId) {
            return res.status(400).json({ message: "carId is required" });
        }

        const slot = await Slot.findByIdAndUpdate(
            req.params.id,
            { $set: { currentCar: carId, status: "occupied" } },
            { new: true }
        ).populate({
            path: "currentCar",
            populate: { path: "owner", select: "name Phone" },
        });

        if (!slot) {
            return res.status(404).json({ message: "slot not found" });
        }
        res.json(slot);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const freeSlot = async (req, res) => {
    try {
        const slot = await Slot.findByIdAndUpdate(
            req.params.id,
            { $set: { status: "empty" }, $unset: { currentCar: "" } },
            { new: true }
        );

        if (!slot) {
            return res.status(404).json({ message: "slot not found" });
        }
        res.json(slot);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteSlot = async (req, res) => {
    try {
        const slot = await Slot.findByIdAndDelete(req.params.id);

        if (!slot) {
            return res.status(404).json({ message: "slot not found" });
        }
        res.json({ message: "slot deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllSlots,
    getSlotById,
    createSlot,
    updateSlot,
    assignCarToSlot,
    freeSlot,
    deleteSlot,
};