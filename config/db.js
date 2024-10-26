const mongoose = require("mongoose");

const connectMongo = async () => {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/chatApp");
    console.log("Mongo is connected !");
  } catch (error) {
    console.error("Mongo error:", error.message);
  }
}

module.exports = connectMongo;