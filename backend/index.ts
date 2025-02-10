import dotenv from "dotenv";
import app from "./src/app";
import { setupSocket } from "./src/socket";

dotenv.config();
const port = process.env.PORT || 3000;
import jwt from "jsonwebtoken";

// index.ts

import http from "http";
import { Server } from "socket.io";
import { driver } from "../backend/src/database/index";
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    // origin: "http://localhost:7070",
    origin: process.env.front_end_ip,
    methods: ["GET", "POST"],
    credentials: true,
  },
});




// io.on("connection", async (socket: any) => {
//   const cookie_jwt = socket.handshake.headers.cookie?.split(";") || [];
//   console.log(typeof cookie_jwt, "\n\n\n");

//   let jwt_token = null;
//   for (let cookie of cookie_jwt) {
//     if (cookie.trim().startsWith("jwt_token=")) {
//       jwt_token = cookie.split("=")[1];
//       break;
//     }
//   }
//   console.log(jwt_token, "-------jwt_token----------\n\n");
//   if (jwt_token) {
//     const decoded: any = await jwt.verify(jwt_token, process.env.JWT_TOKEN_SECRET as string);
//     console.log("-------------------------------------------------------");
//     console.log(decoded.username, " decoded.username ----------------=-\n\n\n\n");
//     console.log("-------------------------------------------------------");
//     socket.join(decoded.username);
//     // Get all socket IDs in the room
//     io.in(decoded.username)
//       .fetchSockets()
//       .then((sockets) => {
//         const socketIds = sockets.map((s) => s.id);
//         console.log(`Sockets in room ${decoded.username}:`, socketIds);
//       });

//     socket.on("disconnect", () => {
//       console.log("User disconnected");
//     });

//     //user liked a user
//     socket.on("User_is_Liked", async (message:any) => {
//       console.log(message, " User_is_Liked -----------------\n\n\n");
//     });

//     socket.on("sendMessage", async (message: any) => {
//       console.log("sendMessage", message);

//       const session_db = await driver.session();
//       try {



//         if(message.length <= 0)
//         {
//           socket.emit("messageError", {
//             message: "Message cannot be empty",
//           });
//           return;
//         }

//         // if(message.to !== null)
//         // {
//         //   if(message.to === decoded.username)
//         //   socket.emit("messageError", {
//         //     message: "You cannot send a message to yourself ! (-,-)",
//         //   });
//         //   return;
//         // }

//         // Create a message object with timestamp
//         const newMessage = {
//           content: message.message,
//           id: new Date().toISOString(),
//           to: message.to,
//           sender: decoded.username,
//         };

//         // Validate message length
//         const wordCount = message.message.length;
//         if (wordCount > 300) {
//           socket.emit("messageError", {
//             message: "Message exceeds 300 word limit",
//           });
//           return;
//         }

//         console.log("New message:------------------", newMessage);

//         // Store message in database

//         if (!session_db) {
//           throw new Error("Failed to create database session");
//         }

//         //check if users matched

//         //         MATCH (u1:User)-[r:MATCHED]-(u2:User)
//         //         WHERE u1.username = "atabiti" AND u2.username = "atabiti_4eecf55234f59899774b"
//         //         RETURN r
//         // ----------------
//         // MATCH p=(u:User {username:"atabiti_4eecf55234f59899774b"})-[:MATCHED]-(o:User {username:"atabiti"})
//         // RETURN p
//         // ------------------------
//         const check_matching = await session_db.run(
//           `
//           MATCH p=(u:User {username:$user1})-[:MATCHED]-(o:User {username:$user2})
//           RETURN p

//           `,
//           { user1: decoded.username, user2: newMessage.to }
//         );
//         if (check_matching.records.length > 0) {

//           const createdAt = Date.now();


//           const query = `
//           MATCH (sender:User {username: $sender})
//           MATCH (receiver:User {username: $to})
//           CREATE (m:Message {
//           createdAt: $createdAt,
//             content: $content,
//             status: 'sent'
//           })
//           CREATE (sender)-[:SENT]->(m)
//           CREATE (m)-[:RECEIVED_BY]->(receiver)
//           RETURN m
//         `;

//           const params = {
//             sender: newMessage.sender,
//             to: newMessage.to,
//             content: newMessage.content
//            ,createdAt:createdAt
//           };
//           console.log(newMessage.id  , " newMessage.id----------ID")

//           const result = await session_db.run(query, params);
//           console.log("here -----12345")
//           socket.to(message.to).emit("newMessage", newMessage);
//           io.to(decoded.username).emit("newMessage", newMessage);
//         } else {
//           console.log("not matched \n\n");
//           socket.emit("messageError", { message: "Not matched users" });
//         }
//       } catch (error) {
//         console.error("Error in sendMessage handler:", error);
//         socket.emit("messageError", { message: "Failed to send message" });
//       } finally {
//         if (session_db) {
//           await session_db.close();
//         }
//       }
//     });
//   }
// });




setupSocket(server);
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// app.listen(port, () => {
//   console.log(`Server is running on port ${port}`);
// });
