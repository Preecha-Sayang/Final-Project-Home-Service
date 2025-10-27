import type { NextApiRequest, NextApiResponse } from "next";
import { sql } from "lib/db";
import { withAdminAuth } from "lib/server/withAdminAuth";
import type { NextApiResponseServerIO } from "types/next";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  const { booking_id, new_status_id, user_id } = req.body;

  const bookingData = await sql`SELECT order_code FROM booking WHERE booking_id = ${booking_id}`;
  const order_code = bookingData[0]?.order_code || `#${booking_id}`;

  const statusMap: Record<number, string> = {
    1: "รอดำเนินการ",
    2: "ดำเนินการอยู่",
    3: "ดำเนินการสำเร็จ",
  };
  const new_status = statusMap[new_status_id] || "ไม่ทราบสถานะ";

  await sql`
    UPDATE booking
    SET status_id = ${new_status_id}, update_at = now()
    WHERE booking_id = ${booking_id};
  `;

 const serverSocket = (res as NextApiResponseServerIO).socket?.server;
if (serverSocket?.io) {
  serverSocket.io.to(`user_${user_id}`).emit("statusUpdate", {
    booking_id,
    order_code,
    new_status,
  });
} else {
  console.warn("⚠️ Socket.IO not initialized yet");
}

  res.status(200).json({ success: true });
}

export default withAdminAuth(handler);
