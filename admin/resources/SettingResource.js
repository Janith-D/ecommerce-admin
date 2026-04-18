const { Setting } = require("../../models");

const canManageSettings = ({ currentAdmin }) => currentAdmin && currentAdmin.role === "admin";

module.exports = {
  resource: Setting,
  options: {
    navigation: {
      icon: 'Settings',
    },
    isAccessible: canManageSettings,
    actions: {
      new: { isAccessible: canManageSettings },
      edit: { isAccessible: canManageSettings },
      delete: { isAccessible: canManageSettings },
      list: { isAccessible: canManageSettings },
      show: { isAccessible: canManageSettings }
    }
  }
};