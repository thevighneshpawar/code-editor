/* eslint-disable */
import express from 'express'
import dotenv from 'dotenv'
import http from 'http'
import { Server } from 'socket.io'
import ACTIONS from './src/Action.js'
dotenv.config()

const app = express()
const server = http.createServer(app)
const PORT = process.env.PORT || 5000
const io = new Server(server)

const userSocketmap = {}

function getAllConnectedClients(roomId) {
  // map
  // 2:22
  return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
    socketId => {
      return {
        socketId,
        username: userSocketmap[socketId]
      }
    }
  )
}

io.on('connection', socket => {
  console.log('socket connected', socket.id)

  socket.on(ACTIONS.JOIN, ({ roomId, username }) => {
    console.log('Received JOIN event:', { roomId, username }); // Debugging output

    // Store the username associated with the socket ID
    userSocketmap[socket.id] = username;

    // Join the specified room
    socket.join(roomId);

    // Get all connected clients in the room
    const clients = getAllConnectedClients(roomId);
    console.log('All connected clients:', clients); // Debugging output

    // Emit the JOINED event to all clients in the room
    clients.forEach(({ socketId }) => {
        io.to(socketId).emit('joined', {
            clients,
            username,
            socketId: socket.id
        });
        console.log('Emitted JOINED event to:', socketId); // Debugging output
    });

    // this event completely socket move hone sai phele
    socket.on('disconnecting',()=>{
      const rooms = [...socket.rooms];
      rooms.forEach((roomId)=>{
        socket.in(roomId).emit(ACTIONS.DISCONNECTED,{
          socketId:socket.id,
          username: userSocketmap[socket.id],

        })
      })
      delete userSocketmap[socket.id]

      socket.leave()
    })
});



})

server.listen(PORT, () => {
  console.log('Server is running on port 5000')
})