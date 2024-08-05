const config = require("../config/auth.config");
const db = require("../models");
const User = db.user;
const Role = db.role;
const constants = require('../common/constants');

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

exports.signup = async (req, res) => {
  try {
    // Validate role
    if (req.body.role && !Object.values(constants.ROLES).includes(req.body.role)) {
      return res.status(400).json({
        errorCode: 400,
        errorMessage: `Invalid role: ${req.body.role}`
      });
    }

    // Assign role based on the request
    const roleName = req.body.role;
    let roleId = null;

    if (roleName) {
      // Find the role by name
      const role = await Role.findOne({ name: roleName });
      if (!role) {
        return res.status(400).json({ message: "Role not found!" });
      }
      roleId = role._id;
    }

    // Create a new user
    const user = new User({
      full_name: req.body.full_name,
      username: req.body.username,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 10),
      address1: req.body.address1,
      address2: req.body.address2,
      company_name: req.body.company_name,
      date_of_birth: req.body.date_of_birth,
      country: req.body.country,
      city: req.body.city,
      zip: req.body.zip,
      phone_number: req.body.phone_number,
      role: roleId,
      status: constants.STATUS.Active,
      pay_when_earn: req.body.pay_when_earn
    });

    // Save the user
    await user.save();

    res.status(201).json({ user, message: "User was registered successfully!" });
  } catch (err) {
    console.error('Error during signup:', err);
    res.status(500).json({ message: 'An error occurred during registration.' });
  }
};

exports.login = (req, res) => {
  // Find user by username and populate the single role
  User.findOne({ username: req.body.username, status: constants.STATUS.Active })
    .populate("role", "-__v") // Updated to 'role' instead of 'roles'
    .exec((err, user) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }

      if (!user) {
        return res.status(404).send({ message: "User Not found." });
      }

      // Check if the provided password matches the stored password
      const passwordIsValid = bcrypt.compareSync(req.body.password, user.password);

      if (!passwordIsValid) {
        return res.status(401).send({
          accessToken: null,
          message: "Invalid Password!"
        });
      }

      // Generate a JWT token
      const token = jwt.sign({ id: user._id }, config.secret, {
        algorithm: 'HS256',
        expiresIn: 86400, // 24 hours
      });

      // Prepare role authorities
      const authorities = user.role ? user.role.name : [];

      // Respond with user data and token
      res.status(200).send({
        id: user._id,
        username: user.username,
        email: user.email,
        role: authorities,
        accessToken: token
      });
    });
};
