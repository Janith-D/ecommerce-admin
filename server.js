require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { sequelize } = require("./models");
const { setupAdmin } = require("./config/admin");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const start = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true }); // Sync models
    
    const admin = await setupAdmin(app);
    
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
