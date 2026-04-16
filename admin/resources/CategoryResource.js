const { Category } = require("../../models");

const canModify = ({ currentAdmin }) => currentAdmin && currentAdmin.role === "admin";

module.exports = {
  resource: Category,
  options: {
    actions: {
      new: { isAccessible: canModify },
      edit: { isAccessible: canModify },
      delete: { isAccessible: canModify }
    }
  }
};