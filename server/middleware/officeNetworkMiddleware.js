const { isOnOfficeNetwork } = require("../utils/officeNetwork");

const requireOfficeNetwork = (req, res, next) => {
    if (!isOnOfficeNetwork(req)) {
        return res.status(403).json({
            message:
                "لا يمكنك إشغال موقف إلا وأنت متصل بشبكة الشركة",
        });
    }
    next();
};

module.exports = { requireOfficeNetwork };
