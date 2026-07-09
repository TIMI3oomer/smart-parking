const express = require("express");
const connectDB = require("./config/db");

const app = express();
app.use(express.json());

const userRoutes = require("./routes/userRoutes");
const carRoutes = require("./routes/carRoutes");
const authRoutes = require("./routes/authRoutes");
const slotRoutes= require("./routes/slotRoutes");
connectDB();

app.use("/api/users", userRoutes);
app.use("/api/cars", carRoutes);
app.use("/api/slot",slotRoutes);
app.use("/api/auth",authRoutes);
app.listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
});