const mongoose = require("mongoose");
const constants = require("../common/constants");

const User = mongoose.model(
  "User",
  new mongoose.Schema({
    full_name: String,
    username: String,
    address1: String,
    address2: String,
    email: String,
    password: String,
    company_name: String,
    date_of_birth: Date,
    country: String,
    city: String,
    zip: String,
    phone_number: String,
    pay_when_earn: String,
    status: { type: String, enum: [constants.STATUS.Active, constants.STATUS.Pending], default: constants.STATUS.Active },
    role:
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Role",
        required: true
      }
  }, {
    timestamps: true // Automatically add createdAt and updatedAt fields
  })
);

module.exports = User;
