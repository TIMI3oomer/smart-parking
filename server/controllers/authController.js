const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "البريد الإلكتروني وكلمة المرور مطلوبان" });
        }

        const user = await User.findOne({ email: email.trim().toLowerCase() }).select("+password");

        if (!user) {
            return res.status(401).json({ message: "البريد الإلكتروني أو كلمة المرور غير صحيحة" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "البريد الإلكتروني أو كلمة المرور غير صحيحة" });
        }

        const token = jwt.sign(
            { id: user._id.toString(), role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "8h" }
        );

        res.json({
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                Phone: user.Phone,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "حدث خطأ ما" });
    }
};

module.exports = { login };