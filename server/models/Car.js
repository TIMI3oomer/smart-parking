const mongoose = require("mongoose");

const carSchema = new mongoose.Schema({
    model: {
        type: String,
        required: true,
    },  
    plate: {
        type: String,
        required: true,
        unique: true,
    },
    color: {
        type: String,
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
}, { timestamps: true });

module.exports = mongoose.model("Car", carSchema);