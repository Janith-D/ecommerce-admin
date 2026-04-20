const { Sequelize } = require("sequelize");
require("dotenv").config();

let sequelize;

if (process.env.DATABASE_URL) {
  // Production (Render, Heroku, Railway)
  const isLocal = process.env.DATABASE_URL.includes("localhost") || process.env.DATABASE_URL.includes("127.0.0.1");
  
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: "postgres",
    logging: false,
    dialectOptions: isLocal ? {} : {
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