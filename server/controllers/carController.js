const Car =require("../models/Car");

const normalizeCreatpayload = (paload = {}) =>
    {
        const normalized = 
        {
            Type: payload.Type,
            plate: payload.plate,
            color: payload.color,
            photo: payload.photo,
        };
        if(typeof payload.owner==="string")
            {
                const trimmedOwner = payload.owner.trim();
                if(trimmedOwner)
                    {
                        normalized.owner = trimmedOwner;
                    }else if (payload.owner)
                        {
                            normalized.owner = payload.owner;
                        }
                                    }

        return normalized;
    };

const normalizeUpdatePayload = (payload = {}) => {
    const update = {}; 
    const unset = {};

    if(Object.prototype.hasOwnProperty.call(payload,"Type"))
        {
            update.Type = payload.Type;
        }
    if(Object.prototype.hasOwnProperty.call(payload,"plate"))
        {
            update.plate = payload.plate;
        }
    if(Object.prototype.hasOwnProperty.call(payload,"color"))
        {
            update.color = payload.color;
        }
    if(Object.prototype.hasOwnProperty.call(payload,"photo"))
        {
            update.photo = payload.photo;
        }
    if(Object.prototype.hasOwnProperty.call(payload,"owner")){
        if(typeof payload.owner === "string")
            {
                const trimmedOwner = payload.owner.trim();
                if(trimmedOwner)
                    {
                        update.owner = trimmedOwner
                    }else
                        {
                            unset.owner = "";
                        }
            }else if (payload.owner){
                update.owner = payload.owner;
            }else{
                unset.owner = "";
            }
    }
    const normalized ;

    if(Object.keys(update).length)
        {
            normalized.$set = update;
        }
    if(Object.keys(unset).length)
        {
            normalized.$unset = unset;
        }
    return normalized;
}

const getAllCars = async (req,res) => 
    {
        try
        {
            const cars = await Car.find().populate("owner","name Phone");
            res.json(cars);
        }catch
        {
            res.status(500).json({ message: error.message });
        }
    };

    const createCar = async(req,res) => 
        {
            try {
                const car = new Car(normalizeCreatpayload(req.body));
                await car.save();
                res.status(201).json(car);
            }
            catch
            {
                res.status(500).json({message:error.message});
            }
        };


        const updateCar = async(req,res) => 
            {
                try
                {
                    const updatePayload = normalizeUpdatePayload(req.body);

                    const car = await car.findByIdAndUpdate(
                        req.params.id,
                        updatePayload,
                        {new:true}
                    ).populate("owner","name Phone");

                    if(!car)
                        {
                            return res.status(404).json({message:"car not found"});
                        }

                        res.json(car);
                }
                catch(error)
                {
                    res.status(500).json({message:error.message});
                }
            };

            const deleteCar = async (req,res) =>
                {
                    try {
                    const car = await car.findByIdAndDelete(req.params.id);

                    if(!car)
                        {
                            return res.status(404).json({message:"car not found"});
                        }
                        res.json({message:"car deleted successfully"});
                    }
                    catch(error)
                    {
                        res.status(500).json({message:error.message});
                    }
                }

                const getCarByPlate = async (req,res) =>
                    {
                        try
                        {
                            const {plateNumber}=req.params ;

                            const car = await Car.findOne({plateNumber});
                            if(!car)
                                {
                                    return res.status(404).json({message:"Car not found"});
                                }
                                res.status(200).json(car);
                        }catch(error)
                        {
                            res.status(500).json({message:error.message});
                        }
                    };


module.exports = {
    getAllCars,
    getCarByPlate,
    createCar,
    updateCar,
    deleteCar
};
