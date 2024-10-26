const WebSocket = require("ws");

const onlineUser = new Map();

const initializeWebSocket = (server) => {
  const wss = new WebSocket.Server({ server });

  wss.on("connection", ws => {

    console.log("server:connected");

    ws.emit("test", () => {
      return "this is test";
    });
  });
}

module.exports = initializeWebSocket;