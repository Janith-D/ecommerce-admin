const { Sequelize } = require("sequelize");
require("dotenv").config();

let sequelize;

if (process.env.DATABASE_URL) {
  // Production (Render, Heroku, Railway)
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: "postgres",
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  });
} else {
  // Local development
  sequelize = new Sequelize(
    process.env.DB_NAME || "ecommerce", 
    process.env.DB_USER || "postgres", 
    process.env.DB_PASS || "postgres", 
    {
      host: process.env.DB_HOST || "localhost",
      dialect: "postgres",
      logging: false
    }
  );
}

module.exports = sequelize;