const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const db = {};

db.mongoose = mongoose;

db.user = require("./user.model");
db.role = require("./role.model");
db.assets = require("./assets.model");
db.keywords = require("./keywords.model");

db.ROLES = ["admin", "buyer", "seller"];

module.exports = db;