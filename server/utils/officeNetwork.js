const ipv4ToLong = (ip) => {
    const parts = ip.split(".");
    if (parts.length !== 4) return null;

    let long = 0;
    for (const part of parts) {
        if (!/^\d{1,3}$/.test(part)) return null;
        const octet = Number(part);
        if (octet < 0 || octet > 255) return null;
        long = (long << 8) + octet;
    }
    return long >>> 0;
};

const isIpInCidr = (ip, cidrEntry) => {
    const ipLong = ipv4ToLong(ip);
    if (ipLong === null) return false;

    if (!cidrEntry.includes("/")) {
        const entryLong = ipv4ToLong(cidrEntry);
        return entryLong !== null && ipLong === entryLong;
    }

    const [range, bitsStr] = cidrEntry.split("/");
    const bits = Number(bitsStr);
    const rangeLong = ipv4ToLong(range);
    if (rangeLong === null || Number.isNaN(bits) || bits < 0 || bits > 32) {
        return false;
    }

    const mask = bits === 0 ? 0 : (~0 << (32 - bits)) >>> 0;
    return (ipLong & mask) === (rangeLong & mask);
};

const normalizeIp = (ip) => {
    if (!ip) return "";
    let normalized = ip.trim();
    if (normalized.startsWith("::ffff:")) {
        normalized = normalized.slice("::ffff:".length);
    }
    return normalized;
};

const getClientIp = (req) => normalizeIp(req.ip);

const getOfficeAllowList = () =>
    (process.env.OFFICE_ALLOWED_IPS || "")
        .split(",")
        .map((entry) => entry.trim())
        .filter(Boolean);

const isOnOfficeNetwork = (req) => {
    const allowList = getOfficeAllowList();

    if (allowList.length === 0) return false;

    const clientIp = getClientIp(req);
    if (!clientIp) return false;

    return allowList.some((entry) => isIpInCidr(clientIp, entry));
};

module.exports = { isOnOfficeNetwork, getClientIp, isIpInCidr };
