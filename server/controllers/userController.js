const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const User = require("../models/User");
const Car = require("../models/Car");
const Slot = require("../models/ParkingSlot");

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const handleServerError = (res, error, fallback = "حدث خطأ ما") => {
    console.error(error);
    if (error.code === 11000) {
        const field = Object.keys(error.keyPattern || {})[0] || "field";
        return res.status(409).json({ message: `${field} مستخدم بالفعل` });
    }
    if (error.name === "CastError") {
        return res.status(400).json({ message: "صيغة المعرف غير صالحة" });
    }
    if (error.name === "ValidationError") {
        return res.status(400).json({ message: "بيانات غير صالحة" });
    }
    return res.status(500).json({ message: fallback });
};

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        handleServerError(res, error, "تعذر تحميل المستخدمين");
    }
};

const getUserByPhone = async (req, res) => {
    try {
        const user = await User.findOne({ phone: req.params.phone });
        if (!user) {
            return res.status(404).json({ message: "المستخدم غير موجود" });
        }
        res.json(user);
    } catch (error) {
        handleServerError(res, error, "تعذر تحميل المستخدم");
    }
};
const createUser = async (req, res) => {
    try {
        const { name, email, password, phone, carModel, carPlate, carColor } = req.body;

        if (!name || !email || !password || !phone || !carModel || !carPlate) {
            return res.status(400).json({
                message: "الاسم والبريد الإلكتروني وكلمة المرور ورقم الهاتف وبيانات السيارة (الطراز واللوحة) مطلوبة",
            });
        }
        if (typeof password !== "string" || password.length < 8) {
            return res.status(400).json({ message: "يجب أن تتكون كلمة المرور من 8 أحرف على الأقل" });
        }

        const normalizedEmail = String(email).trim().toLowerCase();
        const normalizedPhone = String(phone).trim();
        const normalizedPlate = String(carPlate).trim().toUpperCase();

        const existingUser = await User.findOne({
            $or: [{ email: normalizedEmail }, { phone: normalizedPhone }],
        });
        if (existingUser) {
            return res.status(409).json({ message: "البريد الإلكتروني أو رقم الهاتف مستخدم بالفعل" });
        }

        const existingCar = await Car.findOne({ plate: normalizedPlate });
        if (existingCar) {
            return res.status(409).json({ message: "رقم لوحة السيارة مستخدم بالفعل" });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = new User({
            name: String(name).trim(),
            email: normalizedEmail,
            password: hashedPassword,
            phone: normalizedPhone,
            role: "employee",
        });
        await user.save();

        let car;
        try {
            car = await Car.create({
                model: String(carModel).trim(),
                plate: normalizedPlate,
                color: carColor ? String(carColor).trim() : undefined,
                owner: user._id,
            });
        } catch (carError) {
            await User.findByIdAndDelete(user._id);
            throw carError;
        }

        user.car = car._id;
        await user.save();

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            car: {
                _id: car._id,
                model: car.model,
                plate: car.plate,
                color: car.color,
            },
        });
    } catch (error) {
        handleServerError(res, error, "تعذر إنشاء المستخدم");
    }
};
const updateUser = async (req, res) => {
    try {
        if (!isValidId(req.params.id)) {
            return res.status(400).json({ message: "معرف المستخدم غير صالح" });
        }

        const isAdmin = req.user.role === "admin";
        const isSelf = req.user.id === req.params.id;

        if (!isAdmin && !isSelf) {
            return res.status(403).json({ message: "يمكنك تحديث ملفك الشخصي فقط" });
        }

        const update = {};
        if (req.body.name) update.name = String(req.body.name).trim();
        if (req.body.phone) update.phone = String(req.body.phone).trim();
        if (isAdmin && req.body.role) update.role = req.body.role;

        if (Object.keys(update).length === 0) {
            return res.status(400).json({ message: "لا توجد حقول صالحة للتحديث" });
        }

        const user = await User.findByIdAndUpdate(req.params.id, update, {
            new: true,
            runValidators: true,
        });

        if (!user) {
            return res.status(404).json({ message: "المستخدم غير موجود" });
        }
        res.json(user);
    } catch (error) {
        handleServerError(res, error, "تعذر تحديث المستخدم");
    }
};

const deleteUser = async (req, res) => {
    try {
        if (!isValidId(req.params.id)) {
            return res.status(400).json({ message: "معرف المستخدم غير صالح" });
        }
        if (req.user.id === req.params.id) {
            return res.status(400).json({ message: "لا يمكنك حذف حسابك الخاص" });
        }

        const userExists = await User.exists({ _id: req.params.id });
        if (!userExists) {
            return res.status(404).json({ message: "المستخدم غير موجود" });
        }

        const car = await Car.findOne({ owner: req.params.id });

        await Slot.updateMany(
            {
                $or: [
                    { reservedFor: req.params.id },
                    ...(car ? [{ currentCar: car._id }] : []),
                ],
            },
            { $set: { status: "empty", currentCar: null, reservedFor: null } }
        );

        if (car) {
            await Car.findByIdAndDelete(car._id);
        }

        await User.findByIdAndDelete(req.params.id);

        res.json({ message: "تم حذف المستخدم وسيارته بنجاح" });
    } catch (error) {
        handleServerError(res, error, "تعذر حذف المستخدم");
    }
};

module.exports = { getAllUsers, getUserByPhone, deleteUser, updateUser, createUser };