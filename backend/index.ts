import dotenv from "dotenv";
import app from "./src/app";

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
    const decoded: any = await jwt.verify(jwt_token, process.env.JWT_TOKEN_SECRET as string);
    console.log("-------------------------------------------------------");
    console.log(decoded.username, " decoded.username ----------------=-\n\n\n\n");
    console.log("-------------------------------------------------------");
    socket.join(decoded.username);
    // Get all socket IDs in the room
    io.in(decoded.username)
      .fetchSockets()
      .then((sockets) => {
        const socketIds = sockets.map((s) => s.id);
        console.log(`Sockets in room ${decoded.username}:`, socketIds);
      });

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });




    socket.on("sendMessage", async (message: any) => {
      console.log("sendMessage", message);
    
      const session_db = await driver.session();
      try {
        // Create a message object with timestamp
        const newMessage = {
          content: message.message,
          timestamp: new Date(),
          id:  new Date().toISOString(),
          to: message.to,
          sender: decoded.username,
        };
    
        console.log("New message:", newMessage);
    
        // Store message in database
        
        if (!session_db) {
          throw new Error("Failed to create database session");
        }
        

        //check if users matched

//         MATCH (u1:User)-[r:MATCHED]-(u2:User)
//         WHERE u1.username = "atabiti" AND u2.username = "atabiti_4eecf55234f59899774b"
//         RETURN r
// ----------------
// MATCH p=(u:User {username:"atabiti_4eecf55234f59899774b"})-[:MATCHED]-(o:User {username:"atabiti"})
// RETURN p
// ------------------------
        const check_matching = await session_db.run( `
          MATCH p=(u:User {username:$user1})-[:MATCHED]-(o:User {username:$user2})
          RETURN p

          `,{user1:decoded.username,user2:newMessage.to}
        )
        if(check_matching.records.length > 0)
        {


        const query = `
          MATCH (sender:User {username: $sender})
          MATCH (receiver:User {username: $to})
          CREATE (m:Message {
            date:datetime($sending_date),
            content: $content,
            status: 'sent'
          })
          CREATE (sender)-[:SENT]->(m)
          CREATE (m)-[:RECEIVED_BY]->(receiver)
          RETURN m
        `;
    
        const params = {
          sender: newMessage.sender,
          to: newMessage.to,
          content: newMessage.content,sending_date:newMessage.id
        };
    
        const result = await session_db.run(query, params);
    
        socket.to(message.to).emit("newMessage", newMessage);
        io.to(decoded.username).emit("newMessage", newMessage);
      }
    else
    {
      console.log("not matched \n\n")
      socket.emit("messageError", { message: "Not matched users" });
    }
      } catch (error) {
        console.error("Error in sendMessage handler:", error);
        socket.emit("messageError", { message: "Failed to send message" });
      } finally {
        if (session_db) {
          await session_db.close();
        }
      }
    });
  }
});

// const axios = require("axios");

// app.get("/location_specific_service", async (req: any, res: any) => {
//   //get public ip first

//     const response = await axios.get("http://api.ipify.org");
//     console.log(response.data, " , -------res");

//   const pub_ip = response.data
//   console.log(
//     req.ip,
//     " ip --------------------------------------------\n\n\n\n",
//     req.socket.remoteAddress,
//     "}}}]",
//     req.headers["x-forwarded-for"]?.split(",")[0]
//   );

//   const url = `https://apiip.net/api/check?ip=${pub_ip}&accessKey=${process.env.ip_finder_pub}`;
//   const responses = await axios.get(url);
//   const result = responses.data;
//   console.log(result, "sssss---------------result");

// });

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// app.listen(port, () => {
//   console.log(`Server is running on port ${port}`);
// });
