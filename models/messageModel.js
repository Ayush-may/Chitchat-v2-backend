const mongoose = require("mongoose");

const messageSchema = mongoose.Schema({
  mid: {
    type: String,
    required: true,
  }
  ,
  // sender: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: "User"
  // }
  // ,
  // reciever: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: "User"
  // }
  sender: {
    type: String,
    required: true
  }
  ,
  reciever: {
    type: String,
    required: true
  }
  ,
  text: {
    type: String,
    required: true
  }
  ,
  send_at: {
    type: Date,
    default: Date.now()
  }
  ,
  is_read: {
    type: String,
    enum: ["read", "unread"],
    default: "unread"
  }
});

const Message = mongoose.model("Message", messageSchema);
module.exports = Message;
