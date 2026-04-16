const jwt = require("jsonwebtoken");
exports.generateToken = (payload) => jwt.sign(payload, process.env.JWT_SECRET || "secret", { expiresIn: "1d" });
exports.verifyToken = (token) => jwt.verify(token, process.env.JWT_SECRET || "secret");