const { isOnOfficeNetwork, getClientIp } = require("../utils/officeNetwork");

const requireOfficeNetwork = (req, res, next) => {
    if (!isOnOfficeNetwork(req)) {
        return res.status(403).json({
            message:
                "لا يمكنك إشغال موقف إلا وأنت متصل بشبكة الشركة",
        });
    }
    next();
};

// TEMPORARY diagnostic route handler — remove once the office-network
// detection issue is confirmed fixed. Lets a logged-in user see exactly
// what IP the backend is seeing them as, and whether it currently passes
// the office-network check, without needing Render log access.
const debugNetworkStatus = (req, res) => {
    res.json({
        detectedIp: getClientIp(req) || null,
        rawExpressIp: req.ip,
        xForwardedFor: req.headers["x-forwarded-for"] || null,
        trustProxySetting: req.app.get("trust proxy"),
        officeAllowedIpsConfigured: Boolean(process.env.OFFICE_ALLOWED_IPS),
        officeAllowedIpsCount: (process.env.OFFICE_ALLOWED_IPS || "")
            .split(",")
            .map((e) => e.trim())
            .filter(Boolean).length,
        passesOfficeCheck: isOnOfficeNetwork(req),
    });
};

module.exports = { requireOfficeNetwork, debugNetworkStatus };