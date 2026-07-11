const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/User");

const login = async(req,res) =>{
    try{
        const {email,password}= req.body; 
        
        const user =await User.findOne({email}).select("+password");
        if(!user)
            {
                return res.status(401).json({message:"Invalid credentials"});
            }
        
            const isMatch = await bcrypt.compare(password,user.password);
            if(!isMatch){
                return res.status(401).json({message:"Invalid credentials"});
            }
            
            const token = jwt.sign({id: user.id,role:user.role},process.env.JWT_SECRET,{expiresIn:"1h"});

            res.json({token,user:{id:user._id,name:user.name,role:user.role},
            });
    }catch(error)
    {
        res.status(500).json({message:error.message});
    }
}

module.exports={login};