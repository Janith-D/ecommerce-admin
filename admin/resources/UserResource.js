const { User } = require("../../models");

const canManageUsers = ({ currentAdmin }) => currentAdmin && currentAdmin.role === "admin";
const canViewUsers = ({ currentAdmin }) => currentAdmin && ["admin", "manager"].includes(currentAdmin.role);

module.exports = {
  resource: User,
  options: {
    navigation: {
      icon: 'User',
    },
    isAccessible: canViewUsers,
    properties: { password: { isVisible: { list: false, filter: false, show: false, edit: true } } },
    actions: {
      new: { isAccessible: canManageUsers },
      edit: { isAccessible: canManageUsers },
      delete: { isAccessible: canManageUsers },
      list: { isAccessible: canViewUsers },
      show: { isAccessible: canViewUsers }
    }
  }
};