import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { driver } from "./database/index";

let io: Server;

interface ChatUser {
  username: string;
  activeChat?: string; // Stores who the user is actively chatting with
}

const activeChatUsers = new Map<string, ChatUser>();

export function setupSocket(server: HttpServer) {
  io = new Server(server, {
    cors: {
      origin: process.env.front_end_ip,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", async (socket: Socket) => {
    console.log(`⚡ Client connected: ${socket.id}`);

    const cookie_jwt = socket.handshake.headers.cookie?.split(";") || [];
    let jwt_token = null;
    for (let cookie of cookie_jwt) {
      if (cookie.trim().startsWith("jwt_token=")) {
        jwt_token = cookie.split("=")[1];
        break;
      }
    }

    if (jwt_token) {
      try {
        const decoded: any = jwt.verify(jwt_token, process.env.JWT_TOKEN_SECRET as string);
        // socket.join(decoded.username);
        const username = decoded.username;

        // const roomName = `${username}_${socket.id}`;

        console.log(`✅ User ${username} joined room: ${username}`);
        socket.join(username);
        socket.on("leaveRoom", async ({ username }) => {
          const session_db = driver.session();
          try {
            socket.leave(username);
          } catch {}
        });
        // io.in(decoded.username)
        //   .fetchSockets()
        //   .then((sockets) => {
        //     const socketIds = sockets.map((s) => s.id);
        //     console.log(`Sockets in room ${decoded.username}:`, socketIds);
        //   });

        socket.on("disconnect", () => {
          console.log(`❌ User ${decoded.username} disconnected`);
        });

        // Track when users open a chat
        socket.on("openChat", (chatWithUser: string) => {
          if (!activeChatUsers.has(decoded.username)) {
            activeChatUsers.set(decoded.username, { username: decoded.username });
          }
          const user = activeChatUsers.get(decoded.username);
          if (user) {
            user.activeChat = chatWithUser;
          }
        });

        // Track when users close/leave a chat
        socket.on("closeChat", () => {
          const user = activeChatUsers.get(decoded.username);
          if (user) {
            user.activeChat = undefined;
          }
        });

        socket.on("sendMessage", async (message: any) => {
          if (!message || !message.message || message.message.length > 300) {
            socket.emit("messageError", { message: "Invalid message content" });
            return;
          }

          const session_db = driver.session();
          try {
            const newMessage = {
              content: message.message,
              id: new Date().toISOString(),
              to: message.to,
              sender: decoded.username,
              createdAt: Date.now(),
            };

            const check_matching = await session_db.run(
              `MATCH (u:User {username:$user1})-[:MATCHED]-(o:User {username:$user2}) RETURN u, o`,
              { user1: decoded.username, user2: newMessage.to }
            );

            if (check_matching.records.length > 0) {
              await session_db.run(
                `MATCH (sender:User {username: $sender}), (receiver:User {username: $to})
                                 CREATE (m:Message {createdAt: $createdAt, content: $content, status: 'sent'})
                                 CREATE (sender)-[:SENT]->(m)
                                 CREATE (m)-[:RECEIVED_BY]->(receiver)
                                 RETURN m`,
                {
                  sender: newMessage.sender,
                  to: newMessage.to,
                  content: newMessage.content,
                  createdAt: newMessage.createdAt,
                }
              );

              socket.to(message.to).emit("newMessage", newMessage);
              io.to(decoded.username).emit("newMessage", newMessage);

              //notification

              //   const query = `
              //                 MATCH (user:User {username: $username})
              //                 CREATE (n:Notification {
              //                   notify_id: randomUUID(),
              //                   fromUsername: $fromUsername,
              //                   type: $type,
              //                   content: $content,
              //                   createdAt: date(),
              //                   isRead: false
              //                 })
              //                 CREATE (user)-[:YOU_HAVE_A_NOTIFICATION]->(n)
              //                 RETURN n
              //               `;

              //   const notificationArray = `${decoded.username} messaged you!`;
              //   const result = await session_db.run(query, {
              //     fromUsername: username,
              //     username: newMessage.to,
              //     type: "Liked",
              //     content: notificationArray,
              //   });

              //   const notification = result.records[0].get("n").properties;
              //   getSocketIO().to(newMessage.to).emit("notification", notification);
              // Check if recipient should receive a notification
              const recipientUser = activeChatUsers.get(message.to);

              /*
                If Bob sends a message to Alice:

                If Alice is offline → Send notification
                If Alice is chatting with Charlie → Send notification
                If Alice is actively chatting with Bob → Don't send notification 
            */
                const isRecipientOffline = recipientUser === null;
                const isRecipientChattingWithSomeoneElse = recipientUser?.activeChat !== decoded.username;
              
              const shouldNotify = isRecipientOffline || isRecipientChattingWithSomeoneElse;
              if (shouldNotify) {
                // Create notification in database
                const query = `
                     MATCH (user:User {username: $username})
                     CREATE (n:Notification {
                         notify_id: randomUUID(),
                         fromUsername: $fromUsername,
                         type: $type,
                         content: $content,
                         createdAt: date(),
                         isRead: false
                     })
                     CREATE (user)-[:YOU_HAVE_A_NOTIFICATION]->(n)
                     RETURN n
                 `;

                const notificationContent = `${decoded.username} messaged you!`;
                const result = await session_db.run(query, {
                  fromUsername: decoded.username,
                  username: message.to,
                  type: "Message",
                  content: notificationContent,
                });

                const notification = result.records[0].get("n").properties;
                io.to(message.to).emit("notification", notification);
              }
            } else {
              socket.emit("messageError", { message: "Users are not matched" });
            }
          } catch (error) {
            console.error("Error in sendMessage:", error);
            socket.emit("messageError", { message: "Failed to send message" });
          } finally {
            await session_db.close();
          }
        });
      } catch (error) {
        console.error("JWT verification failed:", error);
      }
    }
  });
}

export function getSocketIO(): Server {
  if (!io) {
    throw new Error("Socket.IO is not initialized!");
  }
  return io;
}
