import type { NextApiResponse } from "next";
import type { NextApiRequest } from "next";
import { withAdminAuth, type AdminRequest } from "lib/server/withAdminAuth";
import pool from "lib/db";

/** ดึงเลข booking_id จาก URL */
function parseId(v: string | string[] | undefined): number | null {
  if (!v || Array.isArray(v)) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

/** meta ที่บันทึกลง booking_actions */
type ActionMeta = {
  ip?: string;
  ua?: string;
};

// --- minimal socket typing to avoid any
type SocketRoom = { emit: (event: string, data: unknown) => void };
type SocketServer = { io?: { to: (room: string) => SocketRoom } };
type ResWithSocket = NextApiResponse & { socket: { server: SocketServer } };

async function handler(req: AdminRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const bookingId = parseId((req.query as NextApiRequest["query"]).id);
  if (bookingId == null) {
    return res.status(400).json({ ok: false, message: "invalid id" });
  }

  const adminId = Number(req.admin.adminId);
  const meta: ActionMeta = {
    ip:
      (req.headers["x-forwarded-for"] as string | undefined)
        ?.split(",")[0]
        ?.trim() ||
      req.socket.remoteAddress ||
      undefined,
    ua: req.headers["user-agent"],
  };

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // อัปเดตเฉพาะงานที่ยังว่างอยู่ (กันแข่งกันรับ)
    const up = await client.query<{ booking_id: number; user_id: number; order_code: string }>(
      `
        UPDATE booking
          SET admin_id = $2,
              status_id = 2,  -- รอดำเนินการ (ช่างรับงานแล้ว)
              update_at = now()
          WHERE booking_id = $1
            AND admin_id IS NULL
            AND status_id = 1
          RETURNING booking_id, user_id, order_code
      `,
      [bookingId, adminId]
    );

    if (up.rowCount !== 1) {
      await client.query("ROLLBACK");
      return res.json({ ok: false, message: "already taken or not available" });
    }

    const { user_id, order_code } = up.rows[0];

    // log การกระทำ
    await client.query(
      `
      INSERT INTO booking_actions (booking_id, actor_admin_id, action, meta)
      VALUES ($1, $2, 'accept', $3::jsonb)
    `,
      [bookingId, adminId, JSON.stringify(meta)]
    );

    await client.query("COMMIT");

    // 🔔 ส่งการแจ้งเตือนผ่าน Socket.IO ไปยัง user (typed)
    const r = res as ResWithSocket;
    const io = r.socket?.server?.io;

    if (io && user_id) {
      const notificationData = {
        booking_id: bookingId,
        order_code: order_code || `#${bookingId}`,
        new_status: "รอดำเนินการ",
      };
      io.to(`user_${user_id}`).emit("statusUpdate", notificationData);
      console.log("📢 Emitted statusUpdate:", { ...notificationData, user_id, room: `user_${user_id}` });
    } else {
      console.warn("⚠️ Socket.IO not initialized or user_id missing", { hasIO: !!io, user_id });
    }

    return res.json({ ok: true });
  } catch (e) {
    await client.query("ROLLBACK");
    console.error("❌ Error in accept API:", e);
    return res.status(500).json({ ok: false, message: "server error" });
  } finally {
    client.release();
  }
}

export default withAdminAuth<AdminRequest>(
  handler,
  ["technician", "admin", "manager", "superadmin"]
);
