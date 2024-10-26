const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  uid: {
    type: String,
    required: true,
  }
  ,
  username: {
    type: String,
    required: true,
    lowercase: true,
    index: true,
    unique: true,
  }
  ,
  password: {
    type: String,
    required: true
  }
  ,
  gender: {
    type: String,
    enum: ['male', 'female'],
  }
  ,
  created_at: {
    type: String,
    default: Date.now()
  }
  ,
  status: {
    type: String,
    default: "Hy there!"
  }
  ,
  profile_pic: {
    type: String,
  }
  ,
  friends: [String]
  ,
  messages: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
  }]
})

module.exports = mongoose.model("User", userSchema);