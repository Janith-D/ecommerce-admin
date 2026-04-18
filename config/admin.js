const path = require('path');
const UserResource = require("../admin/resources/UserResource");
const CategoryResource = require("../admin/resources/CategoryResource");
const ProductResource = require("../admin/resources/ProductResource");
const OrderResource = require("../admin/resources/OrderResource");
const OrderItemResource = require("../admin/resources/OrderItemResource");
const SettingResource = require("../admin/resources/SettingResource");
const { User, Order, Product, Setting } = require("../models");
const { comparePassword } = require("../utils/bcrypt");

const setupAdmin = async (app) => {
  const { default: AdminJS, ComponentLoader } = await import("adminjs");
  const AdminJSExpress = await import("@adminjs/express");
  const AdminJSSequelize = await import("@adminjs/sequelize");

  const componentLoader = new ComponentLoader();

  const Components = {
    Dashboard: componentLoader.add('Dashboard', path.resolve(__dirname, '../admin/components/dashboard_v2')),
    Settings: componentLoader.add('Settings', path.resolve(__dirname, '../admin/components/settings')),
  };

  const adminOptions = {
    resources: [UserResource, CategoryResource, ProductResource, OrderResource, OrderItemResource, SettingResource],
    dashboard: {
      component: Components.Dashboard,
      handler: async (request, response, context) => {
        const currentUser = context.currentAdmin;

        if (currentUser && currentUser.role === 'user') {
          const recentOrdersRaw = await Order.findAll({
            where: { userId: currentUser.id },
            limit: 10,
            order: [['createdAt', 'DESC']],
            include: [{ model: User, attributes: ['email'] }]
          });

          const recentOrders = recentOrdersRaw.map(o => ({
            id: o.id,
            total: o.total,
            status: o.status,
            userEmail: o.User ? o.User.email : 'Unknown',
            date: o.createdAt
          }));

          return { currentUser, recentOrders, isUser: true };
        }

        // Admin/Manager Stats
        const usersCount = await User.count();
        const ordersCount = await Order.count();
        const productsCount = await Product.count();
        
        let revenue = await Order.sum('total', { where: { status: 'completed' } });
        if (Number.isNaN(revenue) || revenue === null) revenue = 0.00;

        const recentOrdersRaw = await Order.findAll({
          limit: 5,
          order: [['createdAt', 'DESC']],
          include: [{ model: User, attributes: ['email'] }]
        });

        const recentOrders = recentOrdersRaw.map(o => ({
          id: o.id,
          total: o.total,
          status: o.status,
          userEmail: o.User ? o.User.email : 'Unknown',
          date: o.createdAt
        }));

        // Order Stats for Pie Chart
        const pendingOrders = await Order.count({ where: { status: 'pending' } });
        const completedOrders = await Order.count({ where: { status: 'completed' } });
        const cancelledOrders = await Order.count({ where: { status: 'cancelled' } });

        const orderStats = [
          { name: 'Pending', value: pendingOrders },
          { name: 'Completed', value: completedOrders },
          { name: 'Cancelled', value: cancelledOrders }
        ];

        return { currentUser, usersCount, ordersCount, productsCount, revenue, recentOrders, orderStats, isAdmin: true };
      }
    },
    pages: {
      settings: {
        component: Components.Settings,
        handler: async (request, response, context) => {
          if (request.method === 'post') {
            const data = request.payload || {};
            for (const key of Object.keys(data)) {
              if (key === '__isPost') continue;
              const [setting, created] = await Setting.findOrCreate({
                where: { key },
                defaults: { value: data[key] }
              });
              if (!created) {
                setting.value = data[key];
                await setting.save();
              }
            }
            return { message: "Settings saved successfully!" };
          }
          
          const settingsObj = await Setting.findAll();
          const settings = settingsObj.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {
            storeName: "eCommerce Pro",
            contactEmail: "admin@store.local",
            currency: "USD",
            taxRate: "10" // Default settings
          });
          return { settings };
        }
      }
    },
    componentLoader,
    rootPath: "/admin",
    branding: { companyName: "eCommerce Admin" }
  };

  AdminJS.registerAdapter({
    Resource: AdminJSSequelize.Resource,
    Database: AdminJSSequelize.Database,
  });

  const admin = new AdminJS(adminOptions);

  const adminRouter = AdminJSExpress.buildAuthenticatedRouter(admin, {
    authenticate: async (email, password) => {
      console.log('Login attempt for:', email);
      try {
        if (!email || !password) {
          console.log('Missing email or password in request body.');
          return false;
        }
        const user = await User.findOne({ where: { email } });
        if (user && await comparePassword(password, user.password) && ["admin", "manager", "user"].includes(user.role)) {
          return { id: user.id, email: user.email, role: user.role };
        }
        console.log('Invalid credentials.');
        return false;
      } catch (err) {
        console.error('Auth error:', err);
        return false;
      }
    },
    cookiePassword: process.env.COOKIE_PASSWORD || "some-secure-password-1234567890",
  });

  app.use(admin.options.rootPath, adminRouter);
  
  return admin;
};

module.exports = { setupAdmin };
