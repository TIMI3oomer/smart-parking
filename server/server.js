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

if (process.env.TRUST_PROXY) {
    const trustProxy = Number.isNaN(Number(process.env.TRUST_PROXY))
        ? process.env.TRUST_PROXY
        : Number(process.env.TRUST_PROXY);
    app.set("trust proxy", trustProxy);
}

const frameAncestors = (process.env.EMBED_ALLOWED_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
frameAncestors.unshift("'self'");

app.use(
    helmet({
        frameguard: false,
        contentSecurityPolicy: {
            directives: {
                ...helmet.contentSecurityPolicy.getDefaultDirectives(),
                "frame-ancestors": frameAncestors,
            },
        },
        crossOriginResourcePolicy: { policy: "cross-origin" },
    })
);

const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

app.use(
    cors({
        origin(origin, callback) {

            if (!origin || allowedOrigins.includes(origin)) {
                return callback(null, true);
            }
            return callback(new Error("Not allowed by CORS"));
        },
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
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "محاولات كثيرة جدًا، حاول مرة أخرى لاحقًا" },
});

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "محاولات تسجيل دخول كثيرة جدًا من هذا الجهاز، حاول مرة أخرى لاحقًا" },
});

const apiLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 120,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "عدد كبير جدًا من الطلبات، حاول مرة أخرى بعد قليل" },
});
app.use("/api", apiLimiter);

connectDB();

app.use("/api/users", userRoutes);
app.use("/api/cars", carRoutes);
app.use("/api/slot", slotRoutes);
app.use("/api/auth/login", loginLimiter);
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
