import dotenv from 'dotenv';
import app from "./src/app";

dotenv.config();
const port = process.env.PORT || 3000;

// index.ts

import http from 'http'
import { Server } from "socket.io";
const server = http.createServer(app);


const io = new Server(server, {
  cors: {
    origin: "http://localhost:7070", 
    methods: ["GET", "POST"],
  }
});

io.on('connection', (socket: any) => {
  console.log('A user connected');
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
  socket.on('sendMessage', (message: any) => {
    console.log('sendMessage', message);
    
     // Create a message object with timestamp
     const newMessage = {
      content: message.message,
      timestamp: new Date(),
      id: Date.now()
    };

    // Emit to all connected clients (including sender)
    io.emit('newMessage', newMessage);

  })
  
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// app.listen(port, () => {
//   console.log(`Server is running on port ${port}`);
// });