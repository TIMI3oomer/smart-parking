const express = require("express");
const connectDB = require("./config/db");

const app = express();
app.use(express.json());

const userRoutes = require("./routes/userRoutes");
const carRoutes = require("./routes/carRoutes");

connectDB();

app.use("/users", userRoutes);
app.use("/cars", carRoutes);

app.listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
});