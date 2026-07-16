const mongoose = require("mongoose");

const slotSchema = new mongoose.Schema(
    {
        slotNumber: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            maxlength: 10,
        },
        floor: {
            type: Number,
            default: 1,
            min: 1,
        },
        section: {
            type: String,
            trim: true,
            maxlength: 30,
            default: "Main Area",
        },
        status: {
            type: String,
            enum: ["empty", "reserved", "occupied"],
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
    },
    { timestamps: true }
);

module.exports = mongoose.model("ParkingSlot", slotSchema);
