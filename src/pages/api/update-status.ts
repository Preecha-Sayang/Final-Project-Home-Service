// pages/api/admin/updateStatus.ts
import type { NextApiRequest } from "next";
import { sql } from "lib/db";
import type { NextApiResponse } from "next";
import type { NextApiResponseServerIO } from "types/next";
import { withAdminAuth } from "lib/server/withAdminAuth";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const resIO = res as NextApiResponseServerIO;

  if (req.method !== "POST")
    return resIO.status(405).json({ message: "Method not allowed" });

  const { booking_id, new_status, user_id } = req.body;

  // อัปเดต DB
  await sql`
    UPDATE booking
    SET status = ${new_status}
    WHERE booking_id = ${booking_id};
  `;

  // ส่งผ่าน Socket.IO
  const io = resIO.socket.server.io;
  if (!io) console.warn("⚠️ Socket.IO not initialized yet");

  io?.to(`user_${user_id}`).emit("statusUpdate", { booking_id, new_status });

  resIO.status(200).json({ success: true });
}

export default withAdminAuth(handler);