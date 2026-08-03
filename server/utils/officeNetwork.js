// Detects whether a request is coming from the office network.
//
// IMPORTANT CAVEAT: browsers do NOT expose WiFi SSID/BSSID to JavaScript for
// privacy/security reasons, so "is the user connected to the office WiFi"
// can't be checked client-side. The only server-side signal we actually have
// is the public IP address the request arrives from. This works well when
// the office WiFi/router NATs everyone behind one (or a small, stable set
// of) public IP address(es) or ranges — which is the common case for a
// single-office setup — but it will NOT detect "close to the office" in the
// geographic sense (e.g. someone in the parking lot on cellular data). If
// that's needed later, it requires the Geolocation API on the client
// (navigator.geolocation) compared against office coordinates, which is a
// separate feature, not implemented here per current requirements.
//
// No third-party dependency is used; this is a small, dependency-free IPv4
// CIDR matcher, configured via the OFFICE_ALLOWED_IPS env var (comma
// separated list of single IPs and/or CIDR blocks, e.g.
// "203.0.113.10,203.0.113.0/28").

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
