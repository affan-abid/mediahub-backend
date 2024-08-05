const { model } = require("mongoose");
const Role = require("../models/role.model");

const constants = {
  BASE_URL: "http://localhost:4000",
  NODE_PORT: 4000,
  TOKEN_EXPIRY: 300000,
  APP_REQUEST_DATE_FORMAT: "YYYY-MM-DD",

  STATUS: {
    Active: "Active",
    Pending: "Pending",
    Inactive: "Inactive",
  },

  ROLES: {
    BUYER: "buyer",
    ADMIN: "admin",
    SELLER: "seller",
  },

  CREATE_ROLE: async function createRole(roleName) {
    try {
      const role = new Role({ name: roleName });
      await role.save();
      console.log(`Added '${roleName}' to roles collection`);
    } catch (err) {
      console.error(`Error adding '${roleName}' to roles collection:`, err);
    }
  },

  EXE_TABLE: async function initial() {
    try {
      const count = await Role.estimatedDocumentCount().exec();

      if (count === 0) {
        await constants.CREATE_ROLE(constants.ROLES.BUYER);
        await constants.CREATE_ROLE(constants.ROLES.SELLER);
        await constants.CREATE_ROLE(constants.ROLES.ADMIN);
      }
    } catch (err) {
      console.error("Error counting roles:", err);
    }
  },
};

module.exports = constants;
