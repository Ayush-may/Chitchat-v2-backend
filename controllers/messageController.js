const User = require("../models/userModel");
const Message = require("../models/messageModel");

const bcrypt = require("bcrypt");
const nanoid = require("nanoid");
const jwt = require("jsonwebtoken");

const sendMessages = async (req, res) => {
  try {
    const sender = await User.findOne({ uid: req.user.uid });
    const reciever = await User.findOne({ uid: req.params.frnduid });


    if (!sender.friends.includes(reciever.uid))
      throw new Error("Not a friend, Become a friend first to start a converstation.");

    const newMessage = new Message({
      msgid: nanoid(),
      sender: sender._id,
      reciever: reciever._id,
      text: req.body.text,
      is_read: "unread"
    });

    sender.messages.push(newMessage);
    reciever.messages.push(newMessage);
    
    await newMessage.save()
    await sender.save();
    await reciever.save();

    return res.status(200).json(newMessage);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

module.exports = {
  sendMessages,

}