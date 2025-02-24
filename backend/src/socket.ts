import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { driver } from "./database/index";

let io: Server;

interface ChatUser {
  username: string;
  activeChat?: string;
  socketId: string;
  lastActive: number;
  status: 'online' | 'offline';
}

const activeChatUsers = new Map<string, ChatUser>();


function cleanupInactiveUsers() {
  const now = Date.now();
  for (const [username, user] of activeChatUsers.entries()) {
    // Remove users inactive for more than 30 seconds
    if (now - user.lastActive > 30000) {
    
      // Broadcast user offline status
      io.emit("userStatus", { username, status: 'offline' });
    }
  }
}

// Run cleanup every minute
setInterval(cleanupInactiveUsers, 60000);

async function updateLastSeen(username: string) {
  const session_db = driver.session();
  try {
    const currentTime = Date.now();
    await session_db.run(
      `MATCH (u:User {username: $username})
       SET u.lastSeen = $lastSeen
       RETURN u`,
      { 
        username,
        lastSeen: currentTime
      }
    );
  } catch (error) {
    console.error('Error updating last seen time:', error);
  } finally {
    await session_db.close();
  }
}


export function setupSocket(server: HttpServer) {
  io = new Server(server, {
    cors: {
      origin: process.env.front_end_ip,
      credentials: true,
    },
    transports: ['websocket'], 
  });

  io.on("connection", async (socket: Socket) => {
    const cookie_jwt = socket.handshake.headers.cookie?.split(";") || [];
    let jwt_token = null;
    for (let cookie of cookie_jwt) {
      if (cookie.trim().startsWith("jwt_token=")) {
        jwt_token = cookie.split("=")[1];
        break;
      }
    }

    // io.on("connect_error", (error) => {
    //   
    // });

    if (jwt_token) {
      try {
        const decoded: any = jwt.verify(jwt_token, process.env.JWT_TOKEN_SECRET as string);
        const username_logged = decoded.username;

        // Initialize or update user's online status
        activeChatUsers.set(username_logged, {
          username: username_logged,
          socketId: socket.id,
          lastActive: Date.now(),
          status: 'online'
        });

        // Broadcast user's online status to all clients
        io.emit("userStatus", { 
          username: username_logged, 
          status: 'online' 
        });

        // Send current online users to the newly connected user
        const onlineUsers = Array.from(activeChatUsers.entries()).map(([username, user]) => ({
          username,
          status: user.status
        }));
        socket.emit("onlineUsers", onlineUsers);
        
        socket.join(username_logged);

        // Handle heartbeat to maintain accurate online status
        socket.on("heartbeat", () => {
          const user = activeChatUsers.get(username_logged);
          if (user) {
            user.lastActive = Date.now();
            activeChatUsers.set(username_logged, user);
          }
        });

        socket.on("leaveRoom", async ({ username }) => {
          const session_db = driver.session();
          try {
            socket.leave(username);
          } catch {}
        });

        socket.on("disconnect", async () => {
          // Update last connection time in database when user disconnects
          await updateLastSeen(username_logged);
          
          const user = activeChatUsers.get(username_logged);
          if (user) {
            user.status = 'offline';
            user.lastActive = Date.now();
            activeChatUsers.set(username_logged, user);
            io.emit("userStatus", { 
              username: username_logged, 
              status: 'offline' 
            });
          }
        });

        socket.on("openChat", (chatWithUser: string) => {
          if (!activeChatUsers.has(username_logged)) {
            activeChatUsers.set(username_logged, { 
              username: username_logged,
              socketId: socket.id,
              lastActive: Date.now(),
              status: 'online'
            });
          }
          const user = activeChatUsers.get(username_logged);
          if (user) {
            user.activeChat = chatWithUser;
            user.lastActive = Date.now();
            activeChatUsers.set(username_logged, user);
          }
        });

        socket.on("closeChat", () => {
          const user = activeChatUsers.get(username_logged);
          if (user) {
            user.activeChat = undefined;
            user.lastActive = Date.now();
            activeChatUsers.set(username_logged, user);
          }
        });

        socket.on("getUserStatus", (username: string) => {
          const user = activeChatUsers.get(username);
          socket.emit("userStatusResponse", {
            username,
            status: user?.status || 'offline'
          });
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
              sender: username_logged,
              createdAt: Date.now(),
            };

            const check_matching = await session_db.run(
              `MATCH (u:User {username:$user1})-[:MATCHED]-(o:User {username:$user2}) RETURN u, o`,
              { user1: username_logged, user2: newMessage.to }
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

              io.to([username_logged,message.to]).emit("newMessage", newMessage);
              // socket.to(message.to).emit("newMessage", newMessage);
              // io.to(username_logged).emit("newMessage", newMessage);

              const recipientUser = activeChatUsers.get(message.to);
              const isRecipientOffline = !recipientUser || recipientUser.status === 'offline';
              const isRecipientChattingWithSomeoneElse = recipientUser?.activeChat !== username_logged;
              
              const shouldNotify = isRecipientOffline || isRecipientChattingWithSomeoneElse;
              
              if (shouldNotify) {
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

                const notificationContent = `${username_logged} messaged you!`;
                const result = await session_db.run(query, {
                  fromUsername: username_logged,
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
            socket.emit("messageError", { message: "Failed to send message" });
          } finally {
            await session_db.close();
          }
        });
      } catch (error) {
        socket.emit("messageError", { message: "User is not logged in" });
      }
    }
    socket.emit("messageError", { message: "User is not logged in" });

  });
}

export function getSocketIO(): Server {
  if (!io) {
    throw new Error("Socket.IO is not initialized!");
  }
  return io;
}