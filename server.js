require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");

const Routes = require("./app/routes");
const constants = require("./app/common/constants");

// express app
const app = express();

// middleware
app.use(express.json());
// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse requests of content-type - application/json
app.use(bodyParser.json());

app.use("/public", express.static(path.join(__dirname, "public")));

app.use(cors());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  res.header("Access-Control-Allow-Methods", "*");
  next();
});

app.get("/", (req, res) => {
  res.json({ message: "Index Page for Media Hub Backend Application." });
});

// routes
 Routes.SetupRoutes(app);
 

// connect to db
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    // listen for requests
    app.listen(process.env.PORT, () => {
      console.log("connected to db & listening on port", process.env.PORT);
      constants.EXE_TABLE();
    });
  })
  .catch((error) => {
    console.log(error);
  });
