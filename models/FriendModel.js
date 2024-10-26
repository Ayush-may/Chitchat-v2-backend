const mongoose = require("mongoose");

const friendSchema = mongoose.Schema({
  frnduid: {
    type: String,
    required: true
  },
  messages: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Message"
  }]
});

module.exports = mongoose.model("Friend", friendSchema); 