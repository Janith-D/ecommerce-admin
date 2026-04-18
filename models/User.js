const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const { hashPassword } = require("../utils/bcrypt");

const User = sequelize.define("User", {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM("admin", "manager", "user"), defaultValue: "user" }
}, {
  hooks: {
    beforeCreate: async (user) => { user.password = await hashPassword(user.password); },
    beforeUpdate: async (user) => { if (user.changed("password")) user.password = await hashPassword(user.password); }
  }
});
module.exports = User;