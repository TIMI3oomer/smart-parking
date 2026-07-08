const mongoose = require("mongoose");

const connectDB = async () => {
    try{
    await mongoose.connect("mongodb://localhost:27017/parking-status");
    }catch(error){
        console.error(" MongoDB connected successfully");
        console.error(error.message);
        Process.exit(1);
    }
}

module.exports = connectDB;