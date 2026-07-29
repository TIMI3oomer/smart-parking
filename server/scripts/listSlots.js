require("dotenv").config();
const mongoose = require("mongoose");
const Slot = require("../models/ParkingSlot");

const run = async () => {
    if (!process.env.MONGO_URI) {
        console.error("MONGO_URI is not set in .env");
        process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);

    const slots = await Slot.find().sort({ slotNumber: 1 });

    if (slots.length === 0) {
        console.log("No slots in the database at all. Run: node scripts/seedGarageLayout.js");
    } else {
        console.log(`${slots.length} slot(s) in the database:\n`);
        slots.forEach((s) => {
            console.log(`  ${s.slotNumber}\tstatus=${s.status}\tcategory=${s.category}`);
        });
    }

    await mongoose.disconnect();
    process.exit(0);
};

run().catch((err) => {
    console.error(err);
    process.exit(1);
});