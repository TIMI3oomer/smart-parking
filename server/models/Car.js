const mongoose = require("mongoose");

const carSchema = new mongoose.Schema(
    {
        model: {
            type: String,
            required: true,
            trim: true,
        },
        plate: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            uppercase: true,
        },
        color: {
            type: String,
            trim: true,
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Car", carSchema);