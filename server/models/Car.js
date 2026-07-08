const mongoose = require("mongoose");

const carSchema = new mongoose.Schema({

    Type:
    {
        type: String ,
        required: true ,
    },
    plate:
    {
        type: String,
        required:true,
        unique:true
    }
    
})