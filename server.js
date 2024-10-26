const express = require("express");
require("dotenv").config();
const cors = require("cors");
const connectMongo = require("./config/db");
const userRouter = require("./routes/userRoutes");
const messageRouter = require("./routes/messageRoutes");
const WebSocket = require("ws");
const http = require("http");
const initializeWebSocket = require("./utils/initializeWebSocket");

const app = express();
const server = http.createServer(app);

// initializeWebSocket(server);

app.use(cors({
  credentials: true,
  origin: "http://localhost:3000"
}));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

connectMongo();

app.get("/test", (req, res) => {
  res.send("Server is working");
});

app.use("/api/users", userRouter);
app.use("/api/messages", messageRouter);


const port = process.env.PORT || 7000;
server.listen(port, () => console.log(`Listening on port ${port}`));