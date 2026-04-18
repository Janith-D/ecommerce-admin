const { OrderItem } = require("../../models");

const canModify = ({ currentAdmin }) => currentAdmin && currentAdmin.role === "admin";

module.exports = {
  resource: OrderItem,
  options: {
    actions: {
      new: { isAccessible: canModify },
      edit: { isAccessible: canModify },
      delete: { isAccessible: canModify }
    }
  }
};