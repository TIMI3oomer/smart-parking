const bcrypt = require("bcrypt");
const User = require("../models/User");

const normalizeCreatePayload = (payload = {}) => {
    const normalized = {
        name: payload.name,
        email: payload.email,
        password: payload.password,
        Phone: payload.Phone,
        role: "employee",
    };

    if (typeof payload.car === "string") {
        const trimmedCar = payload.car.trim();
        if (trimmedCar) normalized.car = trimmedCar;
    } else if (payload.car) {
        normalized.car = payload.car;
    }

    return normalized;
};

const normalizeUpdatePayload = (payload = {}) => {
    const update = {};
    const unset = {};

    if (Object.prototype.hasOwnProperty.call(payload, "name")) {
        update.name = payload.name;
    }
    if (Object.prototype.hasOwnProperty.call(payload, "email")) {
        update.email = payload.email;
    }
    if (Object.prototype.hasOwnProperty.call(payload, "Phone")) {
        update.Phone = payload.Phone;
    }
    if (Object.prototype.hasOwnProperty.call(payload, "car")) {
        if (typeof payload.car === "string") {
            const trimmedCar = payload.car.trim();
            if (trimmedCar) {
                update.car = trimmedCar;
            } else {
                unset.car = "";
            }
        } else if (payload.car) {
            update.car = payload.car;
        } else {
            unset.car = "";
        }
    }

    const normalized = {};
    if (Object.keys(update).length) normalized.$set = update;
    if (Object.keys(unset).length) normalized.$unset = unset;

    return normalized;
};

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find(); // password excluded by select:false
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createUser = async (req, res) => {
    try {
        const data = normalizeCreatePayload(req.body);
        data.password = await bcrypt.hash(data.password, 10);

        const user = new User(data);
        await user.save();

        const safeUser = user.toObject();
        delete safeUser.password;

        res.status(201).json(safeUser);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateUser = async (req, res) => {
    try {
        const isOwner =req.user.id === req.params.id;
        const isAdmin =req.user.role === "admin";

        if(!isOwner && isAdmin)
            {
                return res.status(403).json({messsage:"You can only update your own profile"});
            }
        const updatePayload = normalizeUpdatePayload(req.body);

        if (!updatePayload.$set && !updatePayload.$unset) {
            return res.status(400).json({ message: "No fields to update" });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            updatePayload,
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ message: "user not found" });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);

        if (!user) {
            return res.status(404).json({ message: "user not found" });
        }
        res.json({ message: "user deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getUserByPhone = async (req, res) => {
    try {
        const { Phone } = req.params;

        const user = await User.findOne({ Phone });
        if (!user) {
            return res.status(404).json({ message: "user not found" });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllUsers,
    getUserByPhone,
    createUser,
    updateUser,
    deleteUser,
};