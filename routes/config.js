let getClientIp = function(req, getAddr) {
    // var ip = req.ip || req.ips;
    // return ip;
    // return req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || req.ip || req.ips[0] || "";
    var ip = req.headers['x-real-ip'] || req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress || '';
    ip = ip.replace(/::ffff:/g, "");
    var ipAddr = "";
    if (ip) {
        try {
            var ip1 = qqwry.searchIP(ip);
            ipAddr = ip1.Country + ip1.Area;
        } catch (e) { }
    }
    if (getAddr) {
        return {
            ip: ip,
            ipAddr: ipAddr
        };
    }
    return ip;
};

module.exports = {
    getClientIp: getClientIp, //ip获取
};
