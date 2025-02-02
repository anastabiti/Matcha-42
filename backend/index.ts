import dotenv from "dotenv";
import app from "./src/app";

dotenv.config();
const port = process.env.PORT || 3000;
import jwt from "jsonwebtoken";

// index.ts

import http from "http";
import { Server } from "socket.io";
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:7070",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", async (socket: any) => {
  const cookie_jwt = socket.handshake.headers.cookie?.split(";") || [];
  console.log(typeof cookie_jwt, "\n\n\n");

  let jwt_token = null;
  for (let cookie of cookie_jwt) {
    if (cookie.trim().startsWith("jwt_token=")) {
      jwt_token = cookie.split("=")[1];
      break;
    }
  }
  console.log(jwt_token, "-------jwt_token----------\n\n");
  if (jwt_token) {
    const decoded :any= await jwt.verify(jwt_token, process.env.JWT_TOKEN_SECRET as string);
    console.log("-------------------------------------------------------");
    console.log(decoded.username, " decoded.username ----------------=-\n\n\n\n");
    console.log("-------------------------------------------------------");
    socket.join(decoded.username);
    // Get all socket IDs in the room
    io.in(decoded.username).fetchSockets().then((sockets) => {
      const socketIds = sockets.map(s => s.id);
      console.log(`Sockets in room ${decoded.username}:`, socketIds);
  });
  }





  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
  socket.on("sendMessage", (message: any) => {
    console.log("sendMessage", message);

    // Create a message object with timestamp
    const newMessage = {
      content: message.message,
      timestamp: new Date(),
      id: Date.now(),
    };

    // Emit to all connected clients (including sender)
    socket.to('atabiti').emit("newMessage", newMessage);
  });
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// app.listen(port, () => {
//   console.log(`Server is running on port ${port}`);
// });
