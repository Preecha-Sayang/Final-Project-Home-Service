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

    // Pagination
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    // Status filter
    const statusQuery = req.query.status as string | undefined;
    const statusFilter = statusQuery ? statusQuery.split(",") : [];

    // ดึงข้อมูล booking
    const bookings = await sql`
      SELECT 
        b.booking_id,
        b.order_code,
        b.total_price,
        b.discount,
        b.promotion_id,
        b.service_date,
        b.service_time,
        b.comment_rate,
        b.comment_text,
        COALESCE(b.address_data->>'address', '') || ' ' ||
        COALESCE(b.address_data->>'subdistrict', '') || ' ' ||
        COALESCE(b.address_data->>'district', '') || ' ' ||
        COALESCE(b.address_data->>'province', '') AS address,
        s.name AS status_name,
        a.name AS admin_name,
        u.email AS user_email,
        p.code AS promo_code
      FROM booking AS b
      INNER JOIN status AS s ON b.status_id = s.status_id
      LEFT JOIN admin AS a ON b.admin_id = a.admin_id
      INNER JOIN users AS u ON b.user_id = u.user_id
      LEFT JOIN promotions AS p ON b.promotion_id = p.promotion_id
      WHERE u.email = ${email}
        ${statusFilter.length > 0 ? sql`AND s.name = ANY(${statusFilter})` : sql``}
      ORDER BY b.order_code ASC
      LIMIT ${limit} OFFSET ${offset}
    `;

    // รวม total count
    const totalCountResult = await sql`
      SELECT COUNT(*)::int AS total
      FROM booking AS b
      INNER JOIN status AS s ON b.status_id = s.status_id
      INNER JOIN users AS u ON b.user_id = u.user_id
      WHERE u.email = ${email}
        ${statusFilter.length > 0 ? sql`AND s.name = ANY(${statusFilter})` : sql``}
    `;
    const totalCount = totalCountResult[0]?.total || 0;

    if (bookings.length === 0) {
      return res.status(200).json({ ok: true, bookings: [], totalCount, page, limit });
    }

    const bookingIds = bookings.map((b) => b.booking_id);

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

    const bookingsWithItems = bookings.map((b) => {
      const itemList = items
        .filter((i) => i.booking_id === b.booking_id)
        .map((i) => ({
          name: i.item_name,
          quantity: i.quantity,
          unit: i.unit || "",
        }));
      return {
        ...b,
        items: itemList,
        total_price: parseFloat(b.total_price),
        discount: b.discount ? parseFloat(b.discount) : 0,
        promo_code: b.promo_code || null,
      };
    });

    return res.status(200).json({
      ok: true,
      bookings: bookingsWithItems,
      totalCount,
      page,
      limit,
    });
  }
}

export default withAuth(handler);
