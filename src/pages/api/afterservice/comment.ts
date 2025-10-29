import { sql } from "lib/db";
import type { NextApiResponse } from "next";
import { withAuth, AuthenticatedNextApiRequest } from "../../../middlewere/auth";

async function handler(req: AuthenticatedNextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    try {
      const email = req.user?.email;
      const { booking_id, comment_rate, comment_text } = req.body;

      if (!booking_id) {
        return res.status(400).json({ ok: false, message: "booking_id is required" });
      }

      // ✅ ตรวจสอบว่า booking นี้เป็นของ user นี้จริง
      const [booking] = await sql`
        SELECT b.booking_id
        FROM booking b
        INNER JOIN users u ON b.user_id = u.user_id
        WHERE b.booking_id = ${booking_id} AND u.email = ${email};
      `;

      if (!booking) {
        return res.status(403).json({ ok: false, message: "Unauthorized booking" });
      }

      // ✅ update comment
      await sql`
        UPDATE booking
        SET comment_rate = ${comment_rate || null},
            comment_text = ${comment_text || null},
            update_at = NOW()
        WHERE booking_id = ${booking_id};
      `;

      return res.status(200).json({ ok: true, message: "Comment saved" });
    } catch (error: unknown) {
      console.error("❌ Error saving comment:", error);
      return res.status(500).json({ ok: false, message: (error as Error).message });
    }
  }

  return res.status(405).json({ ok: false, message: "Method not allowed" });
}

export default withAuth(handler);
