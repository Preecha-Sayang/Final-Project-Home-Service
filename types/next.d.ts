import type { NextApiResponse } from "next";
import type { Server as IOServer } from "socket.io";
import type { Socket } from "net";
import type { Server as HTTPServer } from "http";

export interface NextApiResponseServerIO extends NextApiResponse {
  socket: Socket & {
    server: HTTPServer & {
      io?: IOServer;
    };
  };
}