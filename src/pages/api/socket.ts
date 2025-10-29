import { Server as HTTPServer } from "http";
import { Server as IOServer } from "socket.io";
import type { NextApiRequest } from "next";
import type { NextApiResponseServerIO } from "types/next";

export default function handler(req: NextApiRequest, res: NextApiResponseServerIO) {
  // ถ้า Socket.IO ถูก initialize แล้ว
  if (res.socket.server.io) {
    console.log("✅ Socket.IO already initialized");
    return res.status(200).json({ message: "Socket server running" });
  }

  console.log("🔌 Initializing Socket.IO...");

  const httpServer = res.socket.server as unknown as HTTPServer;
  const io = new IOServer(httpServer, {
    path: "/api/socket",
    transports: ["polling", "websocket"], // polling เป็น fallback
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("🟢 Client connected:", socket.id);

    socket.on("register", (userId: number) => {
      socket.join(`user_${userId}`);
      console.log(`👤 User ${userId} joined room user_${userId}`);
    });

    socket.on("disconnect", (reason) => {
      console.log("🔴 Client disconnected:", reason);
    });
  });

  res.socket.server.io = io;
  res.status(200).json({ message: "Socket server initialized" });
}
