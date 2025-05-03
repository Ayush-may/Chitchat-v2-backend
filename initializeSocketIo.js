const { Server } = require("socket.io");
const userModel = require("./models/userModel");
const { redis } = require('./server')

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
            const { uid } = data;
            const { id } = socket

            socket.uid = uid
            updateUserStatus(uid, 'online')
            map.set(uid, id)
            mapRev.set(id, uid)

        })


        //**
        // Triggers when user send a message to another user
        // sender sends sid , rid , text as message 
        // sid is sender id
        // rid is receiver id
        // send_at timing of message send
        // is_read - bydefault 'unread'
        // */
        socket.on('message_send', (data) => {
            // user is online
            const { sid, rid, text, send_at, is_read } = data
            const isUserOnline = map.has(rid)
            const uid = socket.uid

            if (isUserOnline) {
                console.log('user is online')

                const onlineSelectedUserSocketId = map.get(rid)
                const selectedUserId = socket.selectedUserId;
                const isTalkingToSameUser = connectedWith.get(selectedUserId) == uid;


                console.log(connectedWith.get(selectedUserId) + "  " + uid)
                console.log(connectedWith.get(selectedUserId) == uid)

                if (!isTalkingToSameUser) {
                    console.log("notifications send : ", onlineSelectedUserSocketId)
                    io.to(onlineSelectedUserSocketId).emit('notification_send', data)
                }

                io.to(onlineSelectedUserSocketId).emit('message_receive', data)
            }
            // handle offline messages
            else {
                console.log('user is offline')
            }

        })

        // Triggers when user select a user
        socket.on('selected_user', ({ selectedUserId }) => {
            socket.selectedUserId = selectedUserId;
            connectedWith.set(socket.uid, selectedUserId)
            console.log('selected user ' + socket.selectedUserId)
        })

        // Triggers when a user leaves
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


        socket.on('receive_img_save_to_db_and_send',(data)=>{
            
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