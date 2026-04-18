const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

module.exports = sequelize.define("Order", {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  status: { type: DataTypes.ENUM("pending", "completed", "cancelled"), defaultValue: "pending" },
  total: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.00 }
});