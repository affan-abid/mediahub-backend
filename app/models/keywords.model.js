const mongoose = require("mongoose");

const Keyword = mongoose.model(
  "Keyword",
  new mongoose.Schema({
    name: String
  })
);

module.exports = Keyword;
