

require("dotenv").config();
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const User = require("../models/User");

const ADMIN = {
    name: "Admin",
    email: "admin@example.com",
    password: "Admin123", // change before running
    Phone: "0000000000",
};

const run = async () => {
    if (!process.env.MONGO_URI) {
        console.error("MONGO_URI is not set in .env");
        process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);

    const existing = await User.findOne({ email: ADMIN.email });
    if (existing) {
        existing.role = "admin";
        await existing.save();
        console.log(`Promoted existing user ${ADMIN.email} to admin.`);
    } else {
        const hashedPassword = await bcrypt.hash(ADMIN.password, 12);
        await User.create({
            name: ADMIN.name,
            email: ADMIN.email,
            password: hashedPassword,
            Phone: ADMIN.Phone,
            role: "admin",
        });
        console.log(`Created admin account ${ADMIN.email}.`);
    }

    await mongoose.disconnect();
    process.exit(0);
};

run().catch((err) => {
    console.error(err);
    process.exit(1);
});