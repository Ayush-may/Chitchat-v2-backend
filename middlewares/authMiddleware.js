const jwt = require("jsonwebtoken");

module.exports = async function authMiddleware(req, res, next) {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const decodedData = jwt.decode(token, process.env.JWT_KEY);

    if (!decodedData)
      throw new Error("Token is not defined");

    if (!req.user) req.user = {}
    req.user.uid = decodedData.uid;

    next();
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: error.message });
  }
}