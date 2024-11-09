module.exports.expandIPv6 = function (ip) {
    // Split into segments by ":"
    let segments = ip.split(":");

    // Count the number of segments that are empty due to "::" shorthand
    const emptyIndex = segments.indexOf("");
    if (emptyIndex !== -1) {
        // Calculate how many "0000" segments are missing
        const nonEmptySegments = segments.filter((seg) => seg !== "");
        const missingSegments = 8 - nonEmptySegments.length;

        // Insert the missing "0000" segments into the position of the empty segment
        segments = [
            ...nonEmptySegments.slice(0, emptyIndex),
            ...Array(missingSegments).fill("0000"),
            ...nonEmptySegments.slice(emptyIndex)
        ];
    }

    // Expand each segment to 4 characters, padding with leading zeros
    const expandedSegments = segments.map((segment) => segment.padStart(4, "0"));

    // Join the segments back together
    return expandedSegments.join(":");
};

module.exports.isPublicIPv4 = function (ip, proxied) {
    const parts = ip.split(".").map(Number);

    // Validate IPv4 address format
    if (parts.length !== 4 || parts.some((part) => isNaN(part) || part < 0 || part > 255)) {
        return false;
    }

    // Exception for 192.0.2.1, assuming the domain is proxied
    if (ip === "192.0.2.1" && proxied) {
        return true;
    }

    // Check for private and reserved IPv4 ranges
    return !(
        // Private ranges
        (
            parts[0] === 10 ||
            (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
            (parts[0] === 192 && parts[1] === 168) ||
            // Reserved or special-use ranges
            (parts[0] === 100 && parts[1] >= 64 && parts[1] <= 127) || // Carrier-grade NAT
            (parts[0] === 169 && parts[1] === 254) || // Link-local
            (parts[0] === 192 && parts[1] === 0 && parts[2] === 0) || // IETF Protocol Assignments
            (parts[0] === 192 && parts[1] === 0 && parts[2] === 2) || // Documentation (TEST-NET-1)
            (parts[0] === 198 && parts[1] === 18) || // Network Interconnect Devices
            (parts[0] === 198 && parts[1] === 51 && parts[2] === 100) || // Documentation (TEST-NET-2)
            (parts[0] === 203 && parts[1] === 0 && parts[2] === 113) || // Documentation (TEST-NET-3)
            parts[0] >= 224
        ) // Multicast and reserved ranges
    );
};

module.exports.isPublicIPv6 = function (ip) {
    const normalizedIP = ip.toLowerCase();

    // Check for private or special-use IPv6 ranges
    return !(
        (
            normalizedIP.startsWith("fc") || // Unique Local Address (ULA)
            normalizedIP.startsWith("fd") || // Unique Local Address (ULA)
            normalizedIP.startsWith("fe80") || // Link-local
            normalizedIP.startsWith("::1") || // Loopback address (::1)
            normalizedIP.startsWith("2001:db8")
        ) // Documentation range
    );
};
