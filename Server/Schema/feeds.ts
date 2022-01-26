const mongoose = require("mongoose");
const feedsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model("feeds", feedsSchema);
