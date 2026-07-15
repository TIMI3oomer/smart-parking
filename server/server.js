const express = require("express");
require("dotenv").config();
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const connectDB = require("./config/db");

if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET is not set. Refusing to start.");
    process.exit(1);
}

const userRoutes = require("./routes/userRoutes");
const carRoutes = require("./routes/carRoutes");
const authRoutes = require("./routes/authRoutes");
const slotRoutes = require("./routes/slotRoutes");

const app = express();

app.use(helmet());

app.use(
    cors({
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        credentials: true,
    })
);

app.use(express.json({ limit: "10kb" }));

app.use((req, res, next) => {
    if (req.body) req.body = mongoSanitize.sanitize(req.body);
    if (req.params) req.params = mongoSanitize.sanitize(req.params);
    next();
});


const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { message: "Too many attempts, please try again later" },
});

connectDB();

app.use("/api/users", userRoutes);
app.use("/api/cars", carRoutes);
app.use("/api/slot", slotRoutes);
app.use("/api/auth", authLimiter, authRoutes);

app.use((req, res) => {
    res.status(404).json({ message: "Not found" });
});


app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.status || 500).json({ message: "Something went wrong" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});