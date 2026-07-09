const jwt = require("jsonwebtoken");

const protect = (req,res,next)=>
    {
        const autHeader = req.headers.authorization;

        if(!autHeader ||!autHeader.startsWith("Bearer")){
            return res.status(401).json({message:"No token provided"});
        }

        const token = autHeader.split(" ")[1];

        try
        {
            const decoded= jwt.verify(token,process.env.JWT_SECRET);
            req.user = decoded;
            next();
        }catch(error)
        {
            return res.status(401).json({message:"Invalid or expire token"});
        }
    }

    module.exports ={protect};