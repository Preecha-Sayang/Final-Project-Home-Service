import { sql } from "lib/db";
import type { NextApiResponse } from "next";
import {
  withAuth,
  AuthenticatedNextApiRequest,
} from "../../../middlewere/auth";


async function handler(req: AuthenticatedNextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const email = req.user?.email;
    if (!email) {
      return res.status(400).json({ ok: false, message: "Email not found in token" });
    }

    // 1️⃣ ดึงข้อมูล booking ทั้งหมดของ user
    const bookings = await sql`
      SELECT 
        b.booking_id,
        b.order_code,
        b.total_price,
        b.service_date,
        b.service_time,
        s.name AS status_name,
        a.name AS admin_name,
        u.email AS user_email
      FROM booking AS b
      INNER JOIN status AS s ON b.status_id = s.status_id
      LEFT JOIN admin AS a ON b.admin_id = a.admin_id
      INNER JOIN users AS u ON b.user_id = u.user_id
      WHERE u.email = ${email}
    `;

    if (bookings.length === 0)
      return res.status(404).json({ ok: false, message: "No bookings found." });

    const bookingIds = bookings.map(b => b.booking_id);

    // 2️⃣ ดึง booking_item + service_option ที่เกี่ยวข้องทั้งหมด
    const items = await sql`
      SELECT 
        bi.booking_id,
        so.name AS item_name,
        so.unit AS unit,
        bi.quantity
      FROM booking_item AS bi
      INNER JOIN service_option AS so ON bi.service_option_id = so.service_option_id
      WHERE bi.booking_id = ANY(${bookingIds})
    `;

    // 3️⃣ รวมข้อมูล items เข้าไปในแต่ละ booking
    const bookingsWithItems = bookings.map(b => {
      const itemList = items
        .filter(i => i.booking_id === b.booking_id)
        .map(i => ({
          name: i.item_name,
          quantity: i.quantity,
          unit: i.unit || ""  // เผื่อไม่มี unit
        }));
      return {
        ...b,
        items: itemList
      };
    });

    return res.status(200).json({ ok: true, bookings: bookingsWithItems });
  }
}

export default withAuth(handler);
