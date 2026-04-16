const { verifyToken } = require("../utils/jwt");
const { error } = require("../utils/response");

module.exports = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return error(res, "No token provided", 401);
  try {
    req.user = verifyToken(token);
    next();
  } catch (err) {
    return error(res, "Invalid token", 401);
  }
};