const { Server } = require("socket.io");
const userModel = require("./models/userModel");

const map = new Map();
const mapRev = new Map();
const connectedWith = new Map()

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
   if (socket.id) {
    socket.uid = data.uid
    console.log('welcome data comes', data)
    updateUserStatus(data.uid, 'online')
    map.set(data.uid, socket.id)
    mapRev.set(socket.id, data.uid)
   }
  })



  // socket.on('message', (data) => {
  //  console.log('Message from client:', data);
  //  socket.broadcast.emit('message', data); 
  // });


  socket.on('message_send', (data) => {
   // user is online
   if (map.has(data.rid)) {
    console.log('user is online')

    const receiveSocketId = map.get(data.rid);
    console.log('diffent persons', socket.connectedWith, data.rid)

    if (socket.connectedWith !== data.rid) {
     console.log('diffent persons', socket.connectedWith, data.rid)
     io.to(receiveSocketId).emit('notification_send', { notify: true })
    }
    io.to(receiveSocketId).emit('message_receive', data)
   }
   // handle offline messages
   else {
    console.log('user is offline')
   }

  })


  socket.on('connected_with_user', ({ withId }) => {
   socket.connectedWith = withId;
   connectedWith.set(socket.uid, withId)
  })


  socket.on('removed_with_user', () => {
   socket.connectedWith = null;
   connectedWith.delete(socket.uid)
  })


  socket.on('logout_user', (data) => {
   console.log('user is loggged out', data)
   updateUserStatus(data.uid, 'offline')
   const socketid = map.get(data.uid)
   map.delete(data.uid)
   mapRev.delete(socketid)
  })



  socket.on('disconnect', () => {
   // console.log('Client disconnected: ', socket.id)
   const disUID = mapRev.get(socket.id)
   mapRev.delete(socket.id)
   map.delete(disUID)
   updateUserStatus(disUID, 'offline')
  });

 });

}


const updateUserStatus = async (UID, status) => {
 try {
  await userModel.findOneAndUpdate(
   { uid: UID },
   { $set: { is_online: status } },
   { new: true }
  );
 } catch (error) {
  console.log(error)
 }
 console.log('status is updated ')
}

module.exports = {
 initializeSocketIo
}