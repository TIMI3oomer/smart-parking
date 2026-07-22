const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "لم يتم توفير رمز الدخول" });
    }

    const token = authHeader.slice("Bearer ".length).trim();
    if (!token) {
        return res.status(401).json({ message: "لم يتم توفير رمز الدخول" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: "رمز الدخول غير صالح أو منتهي الصلاحية" });
    }
};

module.exports = { protect };