const requireAdmin = (req, res, next) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({ message: "للمشرفين فقط" });
    }
    next();
};

module.exports = { requireAdmin };