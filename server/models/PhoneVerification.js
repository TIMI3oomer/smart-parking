const mongoose = require("mongoose");

const phoneVerificationSchema = new mongoose.Schema(
    {
        phone:{
            type: String,
            require: true,
            unique: true,
            trim: true,
        },
        codeHash:{
            type: String,
            require: true,
            select: false,
        },
        expiresAt: {
            type: Date,
            require: true,
            index: true,
        },
        verifiedAt: {
            type: Date,
            default: null,
        },
        attempts: {
            type: Number,
            default: null,
        },
        lastSentAt: {
            type: Date,
            required: true,
        },
    },
    {timestamps: true}
);
module.exports = mongoose.model("PhoneVerification",phoneVerificationSchema);