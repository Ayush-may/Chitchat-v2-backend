const { Server } = require("socket.io");
const userModel = require("./models/userModel");

// {
//  id
//  clientId
// }

const map = new Map();
const mapRev = new Map();

function initializeSocketIo(server) {

 const io = new Server(server, {
  cors: {
   origin: '*',
   methods: "*"
  }
 });

 io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('welcome', (data) => {
   updateUserStatus(data.uid, 'online')
   map.set(data.uid, socket.id)
   mapRev.set(socket.id, data.uid)
  })

  socket.on('message', (data) => {
   console.log('Message from client:', data);
   socket.broadcast.emit('message', data); // send to others
  });

  socket.on('disconnect', () => {

   const disUID = mapRev.get(socket.id)
   mapRev.delete(socket.id)
   map.delete(disUID)
   updateUserStatus(disUID, 'offline')
  });
 });
}

const updateUserStatus = async (UID, status) => {
 await userModel.findOneAndUpdate(
  { uid: UID },
  { $set: { is_online: status } }
 );
 console.log('status is updated ')
}

module.exports = {
 initializeSocketIo
}