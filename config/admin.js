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

const setupAdmin = async (app) => {
  const { default: AdminJS } = await import("adminjs");
  const AdminJSExpress = await import("@adminjs/express");
  const AdminJSSequelize = await import("@adminjs/sequelize");

  AdminJS.registerAdapter({
    Resource: AdminJSSequelize.Resource,
    Database: AdminJSSequelize.Database,
  });

  const admin = new AdminJS(adminOptions);

  const adminRouter = AdminJSExpress.buildAuthenticatedRouter(admin, {
    authenticate: async (email, password) => {
      const user = await User.findOne({ where: { email } });
      if (user && await comparePassword(password, user.password) && ["admin", "manager", "user"].includes(user.role)) {
        return user;
      }
      return false;
    },
    cookiePassword: process.env.COOKIE_PASSWORD || "some-secure-password-1234567890",
  }, null, { resave: false, saveUninitialized: true });

  app.use(admin.options.rootPath, adminRouter);
  
  return admin;
};

module.exports = { setupAdmin };
