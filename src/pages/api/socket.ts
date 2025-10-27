import { Server as HTTPServer } from "http";
import { Server as IOServer } from "socket.io";
import type { NextApiRequest } from "next";
import type { NextApiResponseServerIO } from "types/next";

export default function handler(req: NextApiRequest, res: NextApiResponseServerIO) {
  if (res.socket.server instanceof HTTPServer) {
    console.log("🔌 Initializing Socket.IO...");

    const httpServer: HTTPServer = res.socket.server;
    const io = new IOServer(httpServer, {
      path: "/api/socket",
      addTrailingSlash: false,
    });

    io.on("connection", (socket) => {
      console.log("🟢 Client connected:", socket.id);

      socket.on("register", (userId: number) => {
        socket.join(`user_${userId}`);
        console.log(`👤 User ${userId} joined room user_${userId}`);
      });

      socket.on("disconnect", () => {
        console.log("🔴 Client disconnected:", socket.id);
      });
    });

    res.socket.server.io = io;
  }

  res.status(200).json({ message: "Socket server running" });
}