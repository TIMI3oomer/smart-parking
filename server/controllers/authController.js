const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Car = require("../models/Car");

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME_MS = 5 * 60 * 1000; // 5 minutes

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DUMMY_HASH = "$2b$10$CwTycUXWue0Thq9StjUM0uJ8j8ZQvPT6c1YyfiV0nY8v2pxL7z9Sq";

const register = async (req, res) => {
    try {
        const { name, email, password, phone, carModel, carPlate, carColor } = req.body;

        // Each employee is assumed to own exactly one car, so its info is
        // collected up front at sign-up rather than added later.
        if (!name || !email || !password || !phone || !carModel || !carPlate) {
            return res.status(400).json({
                message: "يرجى تعبئة جميع الحقول المطلوبة، بما في ذلك بيانات السيارة (الطراز ورقم اللوحة)",
            });
        }

        const normalizedEmail = String(email).trim().toLowerCase();

        if (!EMAIL_RE.test(normalizedEmail)) {
            return res.status(400).json({ message: "صيغة البريد الإلكتروني غير صحيحة" });
        }
        if (String(password).length < 8) {
            return res.status(400).json({ message: "يجب أن تتكون كلمة المرور من 8 أحرف على الأقل" });
        }

        const normalizedPlate = String(carPlate).trim().toUpperCase();
        if (!normalizedPlate) {
            return res.status(400).json({ message: "رقم لوحة السيارة مطلوب" });
        }

        const existingUser = await User.findOne({
            $or: [{ email: normalizedEmail }, { phone: String(phone).trim() }],
        });

        if (existingUser) {
            return res.status(409).json({
                message: "البريد الإلكتروني أو رقم الهاتف مستخدم بالفعل",
            });
        }

        const existingCar = await Car.findOne({ plate: normalizedPlate });
        if (existingCar) {
            return res.status(409).json({ message: "رقم لوحة السيارة مستخدم بالفعل" });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await User.create({
            name,
            email: normalizedEmail,
            password: hashedPassword,
            phone,
            role: "employee",
        });

        // Mongoose here isn't guaranteed to run inside a replica-set (needed
        // for multi-document transactions), so on car-creation failure we
        // roll back the just-created user manually to avoid a user account
        // left permanently without its (required) car.
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
            message: "تم إنشاء الحساب بنجاح",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
            },
            car: {
                _id: car._id,
                model: car.model,
                plate: car.plate,
                color: car.color,
            },
        });
    } catch (error) {
        console.error(error);
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern || {})[0];
            const message =
                field === "plate"
                    ? "رقم لوحة السيارة مستخدم بالفعل"
                    : "البريد الإلكتروني أو رقم الهاتف مستخدم بالفعل";
            return res.status(409).json({ message });
        }
        res.status(500).json({
            message: "حدث خطأ أثناء إنشاء الحساب",
        });
    }
};
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "البريد الإلكتروني وكلمة المرور مطلوبان",
            });
        }

        const user = await User.findOne({
            email: String(email).trim().toLowerCase(),
        }).select("+password +failedLoginAttempts +lockUntil");

        if (!user) {
            await bcrypt.compare(password, DUMMY_HASH);
            return res.status(401).json({
                message: "البريد الإلكتروني أو كلمة المرور غير صحيحة",
            });
        }

        if (user.lockUntil && user.lockUntil > new Date()) {
            const minutesLeft = Math.max(1, Math.ceil((user.lockUntil - Date.now()) / 60000));
            return res.status(423).json({
                message: `الحساب مقفل مؤقتًا بسبب محاولات دخول خاطئة متكررة، حاول مرة أخرى بعد ${minutesLeft} دقيقة`,
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;

            if (user.failedLoginAttempts >= MAX_LOGIN_ATTEMPTS) {
                user.lockUntil = new Date(Date.now() + LOCK_TIME_MS);
                user.failedLoginAttempts = 0;
                await user.save();
                return res.status(423).json({
                    message: "تم قفل الحساب مؤقتًا لمدة 5 دقيقة بسبب محاولات دخول خاطئة متكررة",
                });
            }

            await user.save();
            const remaining = MAX_LOGIN_ATTEMPTS - user.failedLoginAttempts;
            return res.status(401).json({
                message: `البريد الإلكتروني أو كلمة المرور غير صحيحة (متبقّي ${remaining} من المحاولات قبل قفل الحساب مؤقتًا)`,
            });
        }

        if (user.failedLoginAttempts || user.lockUntil) {
            user.failedLoginAttempts = 0;
            user.lockUntil = null;
            await user.save();
        }

        const token = jwt.sign(
            {
                id: user._id.toString(),
                role: user.role,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "8h",
            }
        );

        res.json({
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "حدث خطأ ما",
        });
    }
};

module.exports = {
    register,
    login,
};
