require('dotenv').config()

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require('path');
// express app
const app = express()

// middleware
app.use(express.json());


app.use('/public', express.static(path.join(__dirname, 'public')));
// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse requests of content-type - application/json
app.use(bodyParser.json());

app.use(cors());

app.get("/", (req, res) => {
  res.json({ message: "Index Page for HoneyCombDeals Backend Application." });
});

// routes
require("./app/routes/admin.routes")(app);
require("./app/routes/auth.routes")(app);

const db = require("./app/models");
const constants = require('./app/common/constants');
const Role = db.role;

// connect to db
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    // listen for requests
    app.listen(process.env.PORT, () => {
      console.log('connected to db & listening on port', process.env.PORT);
      initial();
    })
  })
  .catch((error) => {
    console.log(error)
  })

function initial() {
  Role.estimatedDocumentCount((err, count) => {
    if (!err && count === 0) {
      new Role({
        name: constants.ROLES.BUYER
      }).save(err => {
        if (err) {
          console.log("error", err);
        }

        console.log("added 'buyer' to roles collection");
      });

      new Role({
        name: constants.ROLES.SELLER
      }).save(err => {
        if (err) {
          console.log("error", err);
        }

        console.log("added 'seller' to roles collection");
      });

      new Role({
        name: constants.ROLES.ADMIN
      }).save(err => {
        if (err) {
          console.log("error", err);
        }

        console.log("added 'admin' to roles collection");
      });
    }
  });
}