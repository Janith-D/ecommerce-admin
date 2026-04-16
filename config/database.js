const { Sequelize } = require("sequelize");
require("dotenv").config();
module.exports = new Sequelize(process.env.DB_NAME || "ecommerce", process.env.DB_USER || "postgres", process.env.DB_PASS || "postgres", {
  host: process.env.DB_HOST || "localhost",
  dialect: "postgres",
  logging: false
});