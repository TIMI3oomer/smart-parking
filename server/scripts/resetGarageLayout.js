require("dotenv").config();
const mongoose = require("mongoose");
const Slot = require("../models/ParkingSlot");

const run = async () => {
    if (!process.env.MONGO_URI) {
        console.error("MONGO_URI is not set in .env");
        process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);

    const result = await Slot.deleteMany({});
    console.log(`Deleted ${result.deletedCount} slot(s). Now run: node scripts/seedGarageLayout.js`);

    await mongoose.disconnect();
    process.exit(0);
};

run().catch((err) => {
    console.error(err);
    process.exit(1);
});