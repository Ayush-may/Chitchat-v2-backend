const mongoose = require("mongoose");

const connectMongo = async () => {
  try {
    // await mongoose.connect("mongodb://127.0.0.1:27017/chatApp");
    await mongoose.connect(`${process.env.MONGO_URL}`);
    console.log("Mongo is connected !");
  } catch (error) {
    console.error("Mongo error:", error.message);
  }
}

module.exports = connectMongo;