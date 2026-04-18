const { User } = require("../models");
const { comparePassword } = require("../utils/bcrypt");
const { generateToken } = require("../utils/jwt");
const { success, error } = require("../utils/response");

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user || !(await comparePassword(password, user.password))) {
      return error(res, "Invalid credentials", 401);
    }
    const token = generateToken({ id: user.id, role: user.role });
    return success(res, { token, user: { id: user.id, email: user.email, role: user.role } }, "Login successful");
  } catch (err) {
    return error(res, err.message);
  }
};