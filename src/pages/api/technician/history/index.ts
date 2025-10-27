// pages/api/technician/history.ts
import type { NextApiResponse } from "next";
import { sql } from "lib/db";
import {
  withAdminAuth,
  AdminRequest,
} from "../../../../../lib/server/withAdminAuth";

async function handler(req: AdminRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const admin = req.admin;
    if (!admin) return res.status(401).json({ message: "Unauthorized" });

    const searchFilter =
      typeof req.query.search === "string" ? req.query.search : undefined;
    const servicenameFilter =
      typeof req.query.servicename === "string"
        ? req.query.servicename
        : undefined;
    const statusFilter =
      typeof req.query.status === "string"
        ? parseInt(req.query.status)
        : undefined;
    const page =
      typeof req.query.page === "string" ? parseInt(req.query.page) : 1;
    const limit = 6;
    const offset = (page - 1) * limit;

    // สร้าง subquery สำหรับ filter ที่เกี่ยวกับ service
    let bookingFilterSubquery = sql``;
    if (searchFilter || servicenameFilter) {
      bookingFilterSubquery = sql`
        AND b.booking_id IN (
          SELECT DISTINCT b2.booking_id
          FROM booking b2
          LEFT JOIN booking_item bi2 ON b2.booking_id = bi2.booking_id
          LEFT JOIN service_option so2 ON bi2.service_option_id = so2.service_option_id
          LEFT JOIN services s2 ON so2.service_id = s2.service_id
          WHERE b2.admin_id = ${admin.adminId}
          AND (
            1=1
            ${
              searchFilter
                ? sql`AND (b2.order_code ILIKE ${`%${searchFilter}%`} OR COALESCE(s2.servicename, '') ILIKE ${`%${searchFilter}%`})`
                : sql``
            }
            ${
              servicenameFilter
                ? sql`AND s2.servicename = ${servicenameFilter}`
                : sql``
            }
          )
        )
      `;
    }

    // นับจำนวนทั้งหมด
    const totalResult = await sql`
      SELECT COUNT(DISTINCT b.booking_id) AS count
      FROM booking b
      WHERE b.admin_id = ${admin.adminId}
      ${statusFilter ? sql`AND b.status_id = ${statusFilter}` : sql``}
      ${bookingFilterSubquery}
    `;
    const total = Number(totalResult[0].count);

    // ดึง booking_id ที่ตรงเงื่อนไข พร้อม pagination
    const bookingIdsResult = await sql`
      SELECT b.booking_id
      FROM booking b
      WHERE b.admin_id = ${admin.adminId}
      ${statusFilter ? sql`AND b.status_id = ${statusFilter}` : sql``}
      ${bookingFilterSubquery}
      ORDER BY b.create_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    if (bookingIdsResult.length === 0) {
      return res.json({ bookings: [], total: 0 });
    }

    const bookingIds = bookingIdsResult.map((row) => row.booking_id);

    // ดึงข้อมูลเต็มของ bookings พร้อม service options
    const rawBookings = await sql`
      SELECT
        b.booking_id, b.user_id, b.total_price,
        b.service_date, b.service_time, b.status_id, b.order_code,
        b.admin_id, b.address_data, b.create_at,
        bi.id AS booking_item_id, bi.service_option_id, bi.quantity, bi.subtotal_price,
        so.name AS service_option_name, so.unit, so.unit_price,
        s.service_id, s.servicename,
        c.category_id, c.name AS category_name
      FROM booking b
      LEFT JOIN booking_item bi ON b.booking_id = bi.booking_id
      LEFT JOIN service_option so ON bi.service_option_id = so.service_option_id
      LEFT JOIN services s ON so.service_id = s.service_id
      LEFT JOIN service_categories c ON s.category_id = c.category_id
      WHERE b.booking_id = ANY(${bookingIds})
      ORDER BY b.create_at DESC
    `;

    // จัดกลุ่มข้อมูลให้ service_options เป็น array
    const bookingsMap = new Map();

    for (const row of rawBookings) {
      const bookingId = row.booking_id;

      // ถ้ายังไม่มี booking นี้ใน Map ให้สร้างใหม่
      if (!bookingsMap.has(bookingId)) {
        bookingsMap.set(bookingId, {
          booking_id: row.booking_id,
          user_id: row.user_id,
          address_id: row.address_id,
          total_price: row.total_price,
          service_date: row.service_date,
          service_time: row.service_time,
          status_id: row.status_id,
          order_code: row.order_code,
          admin_id: row.admin_id,
          address_data: row.address_data,
          create_at: row.create_at,
          service_id: row.service_id,
          servicename: row.servicename,
          category_id: row.category_id,
          category_name: row.category_name,
          service_options: [],
        });
      }

      // เพิ่ม service option เข้า array (ถ้ามี)
      if (row.booking_item_id) {
        bookingsMap.get(bookingId).service_options.push({
          booking_item_id: row.booking_item_id,
          service_option_id: row.service_option_id,
          service_option_name: row.service_option_name,
          unit: row.unit,
          unit_price: row.unit_price,
          quantity: row.quantity,
          subtotal_price: row.subtotal_price,
        });
      }
    }

    // แปลง Map เป็น Array
    const bookings = Array.from(bookingsMap.values());

    return res.json({ bookings, total });
} catch (error: any) {
  console.error("Error fetching bookings:", error.message, error.stack);
  return res.status(500).json({
    message: "Internal Server Error",
    error: error.message,
  });
}
}

export default withAdminAuth(handler, ["admin", "technician"]);