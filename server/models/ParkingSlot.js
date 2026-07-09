const mongoose = require("mongoose");

const slotSchema = new mongoose.Schema({
    slotNumber: {
        type: String,
        required: true,
        unique: true,
    },
    status: {
        type: String,
        enum: ["empty", "occupied", "reserved"],
        default: "empty",
    },
    currentCar: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Car",
        default: null,
    },
    reservedFor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
    },
}, { timestamps: true });

module.exports = mongoose.model("Slot", slotSchema);