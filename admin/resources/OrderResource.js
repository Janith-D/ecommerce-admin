const { Order } = require("../../models");

const canModify = ({ currentAdmin }) => currentAdmin && currentAdmin.role === "admin";

module.exports = {
  resource: Order,
  options: {
    actions: {
      new: { isAccessible: canModify },
      edit: { isAccessible: canModify },
      delete: { isAccessible: canModify }
    }
  }
};