/* eslint-disable */
import express from 'express';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import ACTIONS from './src/Action.js';
import path from 'path';
import cors from 'cors';
import axios from 'axios';
import { fileURLToPath } from 'url'; // Import the fileURLToPath function
import { log } from 'console';
dotenv.config();

// Get the directory path of the current file
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true }));
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;
const io = new Server(server);
app.use(cors());

app.use(express.static('dist'));

// app.use((req, res, next) => {
//   res.sendFile(path.join(__dirname, 'dist', 'index.html'));
// });



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
    // console.log('Received JOIN event:', { roomId, username }); // Debugging output

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

    socket.on(ACTIONS.CODE_CHANGE, ({ code, roomId }) => {
    //   console.log("updating the code");
    //  // Assuming roomId is the second room in socket.rooms array
    //  console.log(roomId);
      io.to(roomId).emit(ACTIONS.SYNC_CODE, { code });
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


//  code Running





})

app.post("/compile", function (req, res) {
  const code = req.body.code;
  const customInput = req.body.input;
  const langId = req.body.lang;
  console.log('compiling');
  try {
    
      const formData = {
          language_id: langId,
          source_code: Buffer.from(code).toString("base64"),
          stdin: Buffer.from(customInput).toString("base64"),
      };
 
      const options = {
          method: "POST",
          url: `https://judge0-ce.p.rapidapi.com/submissions`,
          params: { base64_encoded: "true", fields: "*" },
          headers: {
              "content-type": "application/json",
              "Content-Type": "application/json",
              'X-RapidAPI-Key':process.env.key,
              'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
          },
          data: formData,
      };
      // console.log(formData)

      axios
          .request(options)
          .then(function (response) {
              const token = response.data.token;
              
              checkStatus(token, res);
          })
          .catch((err) => {
              console.error(err);
              res.status(500).json({ error: "Internal server error" });
          });
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
  }
});

const checkStatus = async (token, res) => {

  const options = {
      method: "GET",
      url: "https://judge0-ce.p.rapidapi.com/submissions/" + token,
      params: { base64_encoded: "true", fields: "*" },
      headers: {
          'X-RapidAPI-Key':process.env.key,
          'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
      },
  };
  try {
      let response = await axios.request(options);
      let statusId = response.data.status?.id;

      // Processed - we have a result
      if (statusId === 1 || statusId === 2) {
          // still processing
          setTimeout(() => {
              checkStatus(token, res);
          }, 2000);
          return;
      }

      if (statusId >= 5) {
          const decodedData = response.data.status?.description;;
          res.send(decodedData);
          return decodedData;
      }
      
      else {
          const decodedData = atob(response.data.stdout);
          // console.log(decodedData);
          // console.log(response.status[1]);
          res.send(decodedData);
          return decodedData;
      }
  } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
  }
};

server.listen(PORT, () => {
  console.log('Server is running on port 5000')
})
