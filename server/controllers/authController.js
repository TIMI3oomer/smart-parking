const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Car = require("../models/Car");
const PhoneVerification = require("../models/PhoneVerification");
const { sendSms } = require("../utils/smsSender");

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME_MS = 15 * 60 * 1000; // 15 minutes

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[1-9]\d{7,14}$/;
const DUMMY_HASH = "$2b$10$CwTycUXWue0Thq9StjUM0uJ8j8ZQvPT6c1YyfiV0nY8v2pxL7z9Sq";
const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
const OTP_RESEND_INTERVAL_MS = 60 * 1000; // 1 minute
const MAX_OTP_ATTEMPTS = 5;
const PHONE_VERIFICATION_MAX_AGE_MS = 30 * 60 * 1000; // 30 minutes

const normalizePhone = (phone) => String(phone || "").trim().replace(/[\s-]/g, "");

const generateOtpCode = () => String(Math.floor(100000 + Math.random() * 900000));

const requestPhoneVerification = async (req, res) => {
    try {
        const rawPhone = req.body?.phone;
        const normalizedPhone = normalizePhone(rawPhone);

        if (!normalizedPhone) {
            return res.status(400).json({ message: "رقم الهاتف مطلوب" });
        }
        if (!PHONE_RE.test(normalizedPhone)) {
            return res.status(400).json({ message: "صيغة رقم الهاتف غير صحيحة" });
        }

        const existingUser = await User.findOne({ phone: normalizedPhone });
        if (existingUser) {
            return res.status(409).json({ message: "رقم الهاتف مستخدم بالفعل" });
        }

        const existingVerification = await PhoneVerification.findOne({ phone: normalizedPhone });
        if (
            existingVerification?.lastSentAt &&
            Date.now() - existingVerification.lastSentAt.getTime() < OTP_RESEND_INTERVAL_MS
        ) {
            return res.status(429).json({
                message: "تم إرسال رمز التحقق مؤخرًا، يرجى الانتظار قليلًا قبل إعادة الإرسال",
            });
        }

        const code = generateOtpCode();
        const codeHash = await bcrypt.hash(code, 10);
        const now = new Date();
        const expiresAt = new Date(now.getTime() + OTP_EXPIRY_MS);

        await PhoneVerification.findOneAndUpdate(
            { phone: normalizedPhone },
            {
                phone: normalizedPhone,
                codeHash,
                expiresAt,
                verifiedAt: null,
                attempts: 0,
                lastSentAt: now,
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        await sendSms({
            to: normalizedPhone,
            body: `رمز التحقق الخاص بك هو: ${code}. الرمز صالح لمدة 10 دقائق.`,
        });

        const responsePayload = {
            message: "تم إرسال رمز التحقق إلى رقم الهاتف",
        };

        if (process.env.NODE_ENV !== "production") {
            responsePayload.devCode = code;
        }

        return res.status(200).json(responsePayload);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "تعذر إرسال رمز التحقق، يرجى المحاولة لاحقًا",
        });
    }
};

const verifyPhoneCode = async (req, res) => {
    try {
        const normalizedPhone = normalizePhone(req.body?.phone);
        const code = String(req.body?.code || "").trim();

        if (!normalizedPhone || !code) {
            return res.status(400).json({ message: "رقم الهاتف ورمز التحقق مطلوبان" });
        }

        const verification = await PhoneVerification.findOne({ phone: normalizedPhone }).select("+codeHash");
        if (!verification) {
            return res.status(400).json({ message: "لم يتم طلب رمز تحقق لهذا الرقم" });
        }

        if (verification.expiresAt.getTime() < Date.now()) {
            return res.status(400).json({ message: "انتهت صلاحية رمز التحقق، يرجى طلب رمز جديد" });
        }

        if (verification.attempts >= MAX_OTP_ATTEMPTS) {
            return res.status(429).json({
                message: "تم تجاوز عدد محاولات التحقق المسموح بها، يرجى طلب رمز جديد",
            });
        }

        const isMatch = await bcrypt.compare(code, verification.codeHash);
        if (!isMatch) {
            verification.attempts += 1;
            await verification.save();
            return res.status(400).json({ message: "رمز التحقق غير صحيح" });
        }

        verification.verifiedAt = new Date();
        verification.attempts = 0;
        await verification.save();

        return res.status(200).json({ message: "تم التحقق من رقم الهاتف بنجاح" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "حدث خطأ أثناء التحقق من رقم الهاتف",
        });
    }
};

const register = async (req, res) => {
    try {
        const { name, email, password, phone, carModel, carPlate, carColor } = req.body;
        const normalizedPhone = normalizePhone(phone);

        // Each employee is assumed to own exactly one car, so its info is
        // collected up front at sign-up rather than added later.
        if (!name || !email || !password || !normalizedPhone || !carModel || !carPlate) {
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
        if (!PHONE_RE.test(normalizedPhone)) {
            return res.status(400).json({ message: "صيغة رقم الهاتف غير صحيحة" });
        }

        const normalizedPlate = String(carPlate).trim().toUpperCase();
        if (!normalizedPlate) {
            return res.status(400).json({ message: "رقم لوحة السيارة مطلوب" });
        }

        const existingUser = await User.findOne({
            $or: [{ email: normalizedEmail }, { phone: normalizedPhone }],
        });

        if (existingUser) {
            return res.status(409).json({
                message: "البريد الإلكتروني أو رقم الهاتف مستخدم بالفعل",
            });
        }

        const phoneVerification = await PhoneVerification.findOne({ phone: normalizedPhone });
        if (!phoneVerification?.verifiedAt) {
            return res.status(400).json({ message: "يرجى التحقق من رقم الهاتف أولًا" });
        }
        if (Date.now() - phoneVerification.verifiedAt.getTime() > PHONE_VERIFICATION_MAX_AGE_MS) {
            return res.status(400).json({ message: "انتهت صلاحية التحقق من رقم الهاتف، يرجى التحقق مرة أخرى" });
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
            phone: normalizedPhone,
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
        await PhoneVerification.deleteOne({ phone: normalizedPhone });

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
                    message: "تم قفل الحساب مؤقتًا لمدة 15 دقيقة بسبب محاولات دخول خاطئة متكررة",
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
    requestPhoneVerification,
    verifyPhoneCode,
};
