require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { sequelize } = require("./models");
const { setupAdmin } = require("./config/admin");

const app = express();

app.use(cors());

const start = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true }); // Sync models
    
    // 1. Setup AdminJS Router FIRST (AdminJS relies on formidable and needs unconsumed request streams)
    const admin = await setupAdmin(app);
    
    // 2. Setup standard Express body parsers AFTER AdminJS for all other routes
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // 3. Mount specific API routes
    app.use("/api/auth", require("./routes/auth"));

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`AdminJS started on http://localhost:${PORT}${admin.options.rootPath}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
  }
};

start();
