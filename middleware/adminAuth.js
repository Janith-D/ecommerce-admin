const { error } = require("../utils/response");
module.exports = (req, res, next) => {
  if (!req.user || !["admin", "manager"].includes(req.user.role)) {
    return error(res, "Forbidden", 403);
  }
  next();
};