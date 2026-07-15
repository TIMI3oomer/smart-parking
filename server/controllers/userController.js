const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const User = require("../models/User");

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const handleServerError = (res, error, fallback = "Something went wrong") => {
    console.error(error);
    if (error.code === 11000) {
        const field = Object.keys(error.keyPattern || {})[0] || "field";
        return res.status(409).json({ message: `That ${field} is already in use` });
    }
    if (error.name === "CastError") {
        return res.status(400).json({ message: "Invalid id format" });
    }
    if (error.name === "ValidationError") {
        return res.status(400).json({ message: "Invalid input" });
    }
    return res.status(500).json({ message: fallback });
};

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        handleServerError(res, error, "Failed to load users");
    }
};

const getUserByPhone = async (req, res) => {
    try {
        const user = await User.findOne({ Phone: req.params.Phone });
        if (!user) {
            return res.status(404).json({ message: "user not found" });
        }
        res.json(user);
    } catch (error) {
        handleServerError(res, error, "Failed to load user");
    }
};
const createUser = async (req, res) => {
    try {
        const { name, email, password, Phone } = req.body;

        if (!name || !email || !password || !Phone) {
            return res.status(400).json({ message: "name, email, password, and Phone are required" });
        }
        if (typeof password !== "string" || password.length < 8) {
            return res.status(400).json({ message: "Password must be at least 8 characters" });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = new User({
            name: String(name).trim(),
            email: String(email).trim().toLowerCase(),
            password: hashedPassword,
            Phone: String(Phone).trim(),
            role: "employee",
        });

        await user.save();

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            Phone: user.Phone,
            role: user.role,
        });
    } catch (error) {
        handleServerError(res, error, "Could not create user");
    }
};
const updateUser = async (req, res) => {
    try {
        if (!isValidId(req.params.id)) {
            return res.status(400).json({ message: "Invalid user id" });
        }

        const isAdmin = req.user.role === "admin";
        const isSelf = req.user.id === req.params.id;

        if (!isAdmin && !isSelf) {
            return res.status(403).json({ message: "You can only update your own profile" });
        }

        const update = {};
        if (req.body.name) update.name = String(req.body.name).trim();
        if (req.body.Phone) update.Phone = String(req.body.Phone).trim();
        if (isAdmin && req.body.role) update.role = req.body.role;

        if (Object.keys(update).length === 0) {
            return res.status(400).json({ message: "No valid fields to update" });
        }

        const user = await User.findByIdAndUpdate(req.params.id, update, {
            new: true,
            runValidators: true,
        });

        if (!user) {
            return res.status(404).json({ message: "user not found" });
        }
        res.json(user);
    } catch (error) {
        handleServerError(res, error, "Could not update user");
    }
};

const deleteUser = async (req, res) => {
    try {
        if (!isValidId(req.params.id)) {
            return res.status(400).json({ message: "Invalid user id" });
        }
        if (req.user.id === req.params.id) {
            return res.status(400).json({ message: "You cannot delete your own account" });
        }

        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "user not found" });
        }
        res.json({ message: "user deleted successfully" });
    } catch (error) {
        handleServerError(res, error, "Could not delete user");
    }
};

module.exports = { getAllUsers, getUserByPhone, deleteUser, updateUser, createUser };