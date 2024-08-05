require("dotenv").config();


const constants = require("./app/common/constants");
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
// express app
const app = express();

// middleware
app.use(express.json());

app.use("/public", express.static(path.join(__dirname, "public")));
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

// connect to db
mongoose
  .connect(process.env.MONGO_URI,{
    useNewUrlParser: true,
    useUnifiedTopology: true
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
