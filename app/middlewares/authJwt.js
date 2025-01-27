const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");
const db = require("../models");
const User = db.user;
const Role = db.role;

verifyToken = (req, res, next) => {
  let token = req.headers["x-access-token"];

  if (!token) {
    return res.status(403).send({ message: "No token provided!" });
  }

  jwt.verify(token,
            config.secret,
            (err, decoded) => {
              if (err) {
                return res.status(401).send({
                  message: "Unauthorized!",
                });
              }
              req.userId = decoded.id;
              next();
            });
};

isAdmin = (req, res, next) => {
  User.findById(req.userId).exec((err, user) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }

    Role.findById(user.role, (err, role) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }

      if (role && role.name === "admin") {
        next();
      } else {
        res.status(403).send({ message: "Require Admin Role!" });
      }

      return;
    });
  });
};

isBuyer = (req, res, next) => {
  User.findById(req.userId).exec((err, user) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }

    Role.findById(user.role, (err, role) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }

      if (role && role.name === "buyer") {
        next();
      } else {
        res.status(403).send({ message: "Require Buyer Role!" });
      }

      return;
    });
  });
};

isSeller = (req, res, next) => {
  User.findById(req.userId).exec((err, user) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }

    Role.findById(user.role, (err, role) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }

      if (role && role.name === "seller") {
        next();
      } else {
        res.status(403).send({ message: "Require Seller Role!" });
      }

      return;
    });
  });
};

const authJwt = {
  verifyToken,
  isAdmin,
  isBuyer,
  isSeller
};
module.exports = authJwt;
