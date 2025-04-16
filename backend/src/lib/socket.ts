import { Server, Socket } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST"]
  },
});

// Déclarez le type pour userSocketMap
interface UserSocketMap {
  [userId: string]: string;
}

const userSocketMap: UserSocketMap = {}; // {userId: socketId}

export function getReceiverSocketId(userId: string): string | undefined {
  return userSocketMap[userId];
}

io.on("connection", (socket: Socket) => {
  console.log("A user connected", socket.id);

  const userId = socket.handshake.query.userId as string;
  
  if (userId) {
    if (Array.isArray(userId)) {
      // Si userId est un tableau (peut arriver avec les query params)
      userId.forEach(id => {
        userSocketMap[id] = socket.id;
      });
    } else {
      userSocketMap[userId] = socket.id;
    }
  }

  // Envoyer la liste des utilisateurs connectés à tous les clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
    
    // Trouver et supprimer toutes les entrées correspondant à ce socket.id
    Object.keys(userSocketMap).forEach(userId => {
      if (userSocketMap[userId] === socket.id) {
        delete userSocketMap[userId];
      }
    });

    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };