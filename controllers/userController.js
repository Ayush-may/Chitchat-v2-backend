const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const nanoid = require("nanoid");
const jwt = require("jsonwebtoken");
const Message = require("../models/messageModel");

const checkUserExist = (user) => {
  if (!user) throw new Error();
}

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({});
    const response = users.map(user => ({
      uid: user.uid,
      username: user.username,
      created_at: user.created_at,
      status: user.status,
      profile_pic: user.profile_pic
    }));

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: "Error" });
  }
}

const getUserByUid = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })

    checkUserExist(user);
    const { uid, username, created_at, profile_pic, status } = user;

    return res.status(200).json({
      uid,
      username,
      status,
      profile_pic,
      created_at
    });
  }
  catch (error) {
    return res.end(200).json({});
  }
}

const login = async (req, res) => {
  try {
    console.log('here in backend')
    const user = await User.findOne({ username: req.body.username.toLowerCase() });

    if (!user) throw new Error("User is not present");

    if (!(await bcrypt.compare(req.body.password, user.password)))
      throw new Error();

    user.is_online = "online";
    await user.save();

    const token = jwt.sign({ uid: user.uid }, process.env.JWT_KEY, { expiresIn: "1h" });

    res.cookie(
      "token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 3600000,
    });

    return res.status(200).json({
      uid: user.uid,
      username: user.username,
      token,
      is_online: user.is_online
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

const createUser = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username.toLowerCase() });
    if (user)
      throw new Error("Already a user");

    const newUser = new User({
      uid: nanoid(),
      username: req.body.username.toLowerCase(),
      password: await bcrypt.hash(req.body.password, 10),
      profile_pic: `https://avatar.iran.liara.run/username?username=${req.body.username}`,
      is_online: "online"
    });

    const token = jwt.sign({ uid: newUser.uid }, process.env.JWT_KEY, { expiresIn: "1h" });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 3600000,
    });

    await newUser.save();

    return res.status(200).json({
      uid: newUser.uid,
      username: newUser.username,
      profile_pic: newUser.profile_pic,
      created_at: newUser.created_at,
      status: newUser.status,
      friends: newUser.friends,
      token
    });
  }
  catch (error) {
    return res.status(400).json({ message: error.message || "User creation failed." });
  }
};

const addFriendByUid = async (req, res) => {
  try {
    const user = await User.findOne({ uid: req.body.loggedUser });
    const frnd = await User.findOne({ uid: req.body.frnduid });

    if (!user) throw new Error("User is not found");
    if (!frnd) throw new Error("Friend is not found");

    if (user.friends.includes(frnd.uid)) {
      throw new Error("Already friends");
    }

    user.friends.push(frnd.uid);
    frnd.friends.push(user.uid);
    await user.save();
    await frnd.save();

    return res.status(200).json({ message: "Added to friends" });
  }
  catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

const getLoggedUserFriends = async (req, res) => {
  try {
    const uid = req.params.uid;
    const user = await User.findOne({ uid });

    if (!user || user.friends.length == 0)
      return res.status(400).json({ message: "No friends" });

    const friends = await User.find({ uid: { $in: user.friends } },
      "uid username status profile_pic created_at is_online"
    );

    return res.status(200).json(friends);
  } catch (error) {
    return res.status(400).json(error.message);
  }
}


const getAllLoggedUserNoFriends = async (req, res) => {
  try {
    const uid = req.params.uid;
    const user = await User.findOne({ uid });

    if (!user)
      return res.status(400).json({ message: "No friends" });

    const friends = await User.find({
      $and: [
        { uid: { $nin: user.friends } },
        { uid: { $ne: uid } }
      ],
    }, "uid username status profile_pic created_at");

    return res.status(200).json(friends);
  } catch (error) {
    return res.status(400).json(error.message);
  }
}

const getLoggedUserAndSelectedUserMessages = async (req, res) => {
  try {
    const sender = req.params.loggedUid;
    const reciever = req.params.selectedUid;

    // const messages = await Message.find({
    //   $or:
    //     [
    //       { sender, reciever },
    //       { sender: reciever, reciever: sender },
    //     ]
    // })
    //   .sort({ send_at: 1 });

    const messages = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender, reciever }, // Messages sent from logged user to selected user
            { sender: reciever, reciever: sender }, // Messages sent from selected user to logged user
          ]
        }
      },
      {
        $lookup: {
          from: 'users', // The name of your users collection
          localField: 'sender', // Field from the messages collection
          foreignField: 'uid', // Field from the users collection
          as: 'senderData' // The name of the new field to add the user data to
        },
      },
      {
        $lookup: {
          from: 'users', // The name of your users collection
          localField: 'reciever', // Field from the messages collection
          foreignField: 'uid', // Field from the users collection
          as: 'recieverData' // The name of the new field to add the user data to
        }
      },
      {
        $unwind: {
          path: '$senderData',
          preserveNullAndEmptyArrays: true // This will include messages even if the sender doesn't have a corresponding user
        }
      },
      {
        $unwind: {
          path: "$recieverData",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: { // Specify the fields to include
          _id: 1, // Include message ID
          mid: 1,
          sender: 1, // Include sender ID
          reciever: 1, // Include receiver ID
          text: 1, // Include message text
          send_at: 1, // Include send timestamp,
          'senderData.uid': 1, // Include uid from senderData
          'senderData.username': 1, // Include username from senderData
          'senderData.profile_pic': 1, // Include profile_pic from senderData,
          'recieverData.uid': 1,
          'recieverData.username': 1,
          'recieverData.profile_pic': 1,
        }
      },
      {
        $sort: { send_at: 1 } // Sort by the send_at field
      }
    ]);

    return res.status(200).json(messages);
  } catch (error) {
    return res.status(400).json(error.message);
  }
}

const setLoggedUserAndSelectedUserMessages = async (req, res) => {
  try {
    const sender = req.params.loggedUid;
    const reciever = req.params.selectedUid;
    const text = req.body.text;

    const newMessage1 = new Message({
      mid: nanoid(),
      sender,
      reciever,
      text,
    });

    // const newMessage2 = new Message({
    //   mid: nanoid(),
    //   sender: reciever,
    //   reciever: sender,
    //   text,
    // });

    await newMessage1.save();
    // await newMessage2.save();

    return res.status(200).json(newMessage1);
    // return res.status(200).json([newMessage1, newMessage2]);
  } catch (error) {
    return res.status(400).json(error.message);
  }
}


const changeOnlineStatusToOffline = async (req, res) => {
  try {
    const uid = req.params.uid;

    const user = await User.findOne({ uid });
    user.is_online = "offline";

    await user.save();

    return res.status(200).json(user);
  } catch (error) {
    return res.status(400).json(error.message);
  }
}
module.exports = {
  getAllUsers,
  getUserByUid,
  login,
  createUser,
  addFriendByUid,
  getLoggedUserFriends,
  getAllLoggedUserNoFriends,
  getLoggedUserAndSelectedUserMessages,
  setLoggedUserAndSelectedUserMessages,
  changeOnlineStatusToOffline
}