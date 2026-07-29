require("dotenv").config();
const mongoose = require("mongoose");
const Slot = require("../models/ParkingSlot");
const LAYOUT = require("../data/garageLayout");

const run = async () => {
    const uri = process.env.MONGO_URI
    if (!uri) {
        console.error("MONGO_URI is not set in .env");
        process.exit(1);
    }

    await mongoose.connect(uri);

    const existing = await Slot.find({}, "slotNumber");
    const existingNumbers = new Set(existing.map((s) => s.slotNumber.toLowerCase()));

    const toCreate = LAYOUT.filter((s) => !existingNumbers.has(s.slotNumber.toLowerCase()));

    if (toCreate.length === 0) {
        console.log("All garage slots already exist. Nothing to do.");
    } else {
        await Slot.insertMany(toCreate);
        console.log(`Created ${toCreate.length} slot(s): ${toCreate.map((s) => s.slotNumber).join(", ")}`);
    }

    await mongoose.disconnect();
    process.exit(0);
};

run().catch((err) => {
    console.error(err);
    process.exit(1);
});
