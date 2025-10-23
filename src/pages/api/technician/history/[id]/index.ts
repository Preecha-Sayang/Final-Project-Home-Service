import type { NextApiResponse } from "next";
import { sql } from "lib/db";
import { withAdminAuth, AdminRequest } from "../../../../../../lib/server/withAdminAuth";

async function handler(req: AdminRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const admin = req.admin;
    if (!admin) return res.status(401).json({ message: "Unauthorized" });

    const bookingId = req.query.id as string;
    if (!bookingId) return res.status(400).json({ message: "Booking ID is required" });

    // ดึงรายละเอียด booking
    const result = await sql`
      SELECT 
        b.booking_id,
        s.servicename AS service_name,
        c.name AS category,
        STRING_AGG(
          CONCAT(so.name, ' ', bi.quantity, ' ', so.unit), 
          ', ' 
          ORDER BY bi.id
        ) AS items,
        TO_CHAR(b.service_date, 'DD/MM/YYYY') AS service_date,
        b.service_time,
        b.comment_rate,
        b.comment_text,
        COALESCE(b.address_data->>'address', '') || ' ' ||
        COALESCE(b.address_data->>'subDistrict', '') || ' ' ||
        COALESCE(b.address_data->>'district', '') || ' ' ||
        COALESCE(b.address_data->>'province', '') AS address,
        b.order_code,
        b.total_price,
        u.fullname AS customer_name,
        u.phone_number AS customer_phone
      FROM booking b
      LEFT JOIN booking_item bi ON b.booking_id = bi.booking_id
      LEFT JOIN service_option so ON bi.service_option_id = so.service_option_id
      LEFT JOIN services s ON so.service_id = s.service_id
      LEFT JOIN service_categories c ON s.category_id = c.category_id
      LEFT JOIN users u ON b.user_id = u.user_id
      WHERE b.booking_id = ${bookingId} 
        AND b.admin_id = ${admin.adminId}
      GROUP BY 
        b.booking_id, s.servicename, c.name,
        b.service_date, b.service_time, b.address_data,
        b.order_code, b.total_price, 
        u.fullname, u.phone_number
    `;

    if (!result || result.length === 0) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // เพิ่ม rating และ comment เป็น default values
    const booking = {
      ...result[0],
    };

    return res.status(200).json({ booking });
  } catch (error) {
    console.error("Error fetching booking detail:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export default withAdminAuth(handler, ["admin", "technician"]);