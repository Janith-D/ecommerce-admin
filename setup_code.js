const fs = require("fs");
const path = require("path");

const files = {
  "config/constants.js": `module.exports = { ROLES: { ADMIN: "admin", MANAGER: "manager", USER: "user" } };`,
  "config/database.js": `const { Sequelize } = require("sequelize");
require("dotenv").config();
module.exports = new Sequelize(process.env.DB_NAME || "ecommerce", process.env.DB_USER || "postgres", process.env.DB_PASS || "postgres", {
  host: process.env.DB_HOST || "localhost",
  dialect: "postgres",
  logging: false
});`,
  "utils/bcrypt.js": `const bcrypt = require("bcrypt");
exports.hashPassword = (password) => bcrypt.hash(password, 10);
exports.comparePassword = (password, hash) => bcrypt.compare(password, hash);`,
  "utils/jwt.js": `const jwt = require("jsonwebtoken");
exports.generateToken = (payload) => jwt.sign(payload, process.env.JWT_SECRET || "secret", { expiresIn: "1d" });
exports.verifyToken = (token) => jwt.verify(token, process.env.JWT_SECRET || "secret");`,
  "utils/response.js": `exports.success = (res, data, message = "Success", status = 200) => res.status(status).json({ success: true, message, data });
exports.error = (res, message = "Error", status = 500) => res.status(status).json({ success: false, message });`,
  "models/User.js": `const { DataTypes } = require("sequelize");
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
module.exports = User;`,
  "models/Category.js": `const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

module.exports = sequelize.define("Category", {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT }
});`,
  "models/Product.js": `const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

module.exports = sequelize.define("Product", {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  price: { type: DataTypes.DECIMAL(10, 2), allowNull: false }
});`,
  "models/Order.js": `const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

module.exports = sequelize.define("Order", {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  status: { type: DataTypes.ENUM("pending", "completed", "cancelled"), defaultValue: "pending" },
  total: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.00 }
});`,
  "models/OrderItem.js": `const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

module.exports = sequelize.define("OrderItem", {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
  price: { type: DataTypes.DECIMAL(10, 2), allowNull: false }
});`,
  "models/Setting.js": `const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

module.exports = sequelize.define("Setting", {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  key: { type: DataTypes.STRING, unique: true, allowNull: false },
  value: { type: DataTypes.TEXT, allowNull: false }
});`,
  "models/index.js": `const sequelize = require("../config/database");
const User = require("./User");
const Category = require("./Category");
const Product = require("./Product");
const Order = require("./Order");
const OrderItem = require("./OrderItem");
const Setting = require("./Setting");

User.hasMany(Order, { foreignKey: "userId" });
Order.belongsTo(User, { foreignKey: "userId" });

Category.hasMany(Product, { foreignKey: "categoryId" });
Product.belongsTo(Category, { foreignKey: "categoryId" });

Order.hasMany(OrderItem, { foreignKey: "orderId" });
OrderItem.belongsTo(Order, { foreignKey: "orderId" });

Product.hasMany(OrderItem, { foreignKey: "productId" });
OrderItem.belongsTo(Product, { foreignKey: "productId" });

module.exports = { sequelize, User, Category, Product, Order, OrderItem, Setting };`,
  "admin/resources/UserResource.js": `const { User } = require("../../models");
module.exports = {
  resource: User,
  options: {
    properties: { password: { isVisible: { list: false, filter: false, show: false, edit: true } } },
    actions: {
      new: { isAccessible: ({ currentAdmin }) => currentAdmin && currentAdmin.role === "admin" },
      edit: { isAccessible: ({ currentAdmin }) => currentAdmin && currentAdmin.role === "admin" },
      delete: { isAccessible: ({ currentAdmin }) => currentAdmin && currentAdmin.role === "admin" }
    }
  }
};`,
  "admin/resources/ProductResource.js": `const { Product } = require("../../models");
module.exports = { resource: Product, options: {} };`,
  "admin/resources/CategoryResource.js": `const { Category } = require("../../models");
module.exports = { resource: Category, options: {} };`,
  "admin/resources/OrderResource.js": `const { Order } = require("../../models");
module.exports = { resource: Order, options: {} };`,
  "admin/resources/OrderItemResource.js": `const { OrderItem } = require("../../models");
module.exports = { resource: OrderItem, options: {} };`,
  "admin/resources/SettingResource.js": `const { Setting } = require("../../models");
module.exports = {
  resource: Setting,
  options: {
    actions: {
      new: { isAccessible: ({ currentAdmin }) => currentAdmin && currentAdmin.role === "admin" },
      edit: { isAccessible: ({ currentAdmin }) => currentAdmin && currentAdmin.role === "admin" },
      delete: { isAccessible: ({ currentAdmin }) => currentAdmin && currentAdmin.role === "admin" }
    }
  }
};`,
  "admin/pages/dashboard.js": `module.exports = { handler: async (request, response, context) => { return { message: "Welcome to eCommerce Admin Dashboard" }; }, component: false };`,
  "admin/pages/settings.js": `module.exports = { handler: async (request, response, context) => { return { message: "Settings Page" }; }, component: false };`,
  "config/admin.js": `const AdminJS = require("adminjs");
const AdminJSExpress = require("@adminjs/express");
const AdminJSSequelize = require("@adminjs/sequelize");
AdminJS.registerAdapter(AdminJSSequelize);

const UserResource = require("../admin/resources/UserResource");
const CategoryResource = require("../admin/resources/CategoryResource");
const ProductResource = require("../admin/resources/ProductResource");
const OrderResource = require("../admin/resources/OrderResource");
const OrderItemResource = require("../admin/resources/OrderItemResource");
const SettingResource = require("../admin/resources/SettingResource");
const dashboard = require("../admin/pages/dashboard");
const settings = require("../admin/pages/settings");
const { User } = require("../models");
const { comparePassword } = require("../utils/bcrypt");

const adminOptions = {
  resources: [UserResource, CategoryResource, ProductResource, OrderResource, OrderItemResource, SettingResource],
  pages: { dashboard, settings },
  rootPath: "/admin",
  branding: { companyName: "eCommerce Admin" }
};

const buildAdminRouter = (admin) => {
  return AdminJSExpress.buildAuthenticatedRouter(admin, {
    authenticate: async (email, password) => {
      const user = await User.findOne({ where: { email } });
      if (user && await comparePassword(password, user.password) && ["admin", "manager"].includes(user.role)) {
        return user;
      }
      return false;
    },
    cookiePassword: process.env.COOKIE_PASSWORD || "some-secure-password-1234567890",
  }, null, { resave: false, saveUninitialized: true });
};

module.exports = { adminOptions, buildAdminRouter };`,
  "middleware/auth.js": `const { verifyToken } = require("../utils/jwt");
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
};`,
  "middleware/adminAuth.js": `const { error } = require("../utils/response");
module.exports = (req, res, next) => {
  if (!req.user || !["admin", "manager"].includes(req.user.role)) {
    return error(res, "Forbidden", 403);
  }
  next();
};`,
  "controllers/authController.js": `const { User } = require("../models");
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
};`,
  "routes/auth.js": `const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.post("/login", authController.login);
module.exports = router;`,
  "server.js": `require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { sequelize } = require("./models");
const AdminJS = require("adminjs");
const { adminOptions, buildAdminRouter } = require("./config/admin");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const start = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true }); // Sync models
    
    const admin = new AdminJS(adminOptions);
    const adminRouter = buildAdminRouter(admin);
    app.use(admin.options.rootPath, adminRouter);
    
    app.use("/api/auth", require("./routes/auth"));

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(\`AdminJS started on http://localhost:\${PORT}\${admin.options.rootPath}\`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
  }
};

start();`
};

for (const [filePath, content] of Object.entries(files)) {
  const fullPath = path.join(__dirname, filePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim());
}
console.log("All files created successfully!");

