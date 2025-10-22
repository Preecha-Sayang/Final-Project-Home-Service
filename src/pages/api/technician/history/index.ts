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
  typeof req.query.servicename === "string" ? req.query.servicename : undefined;

const statusFilter =
  typeof req.query.status === "string" ? parseInt(req.query.status) : undefined;
    const bookings = await sql`
  SELECT
    b.booking_id,
    b.user_id,
    b.address_id,
    b.total_price,
    b.service_date,
    b.service_time,
    b.status_id,
    b.order_code,
    b.admin_id,
    b.address_data,

    bi.id AS booking_item_id,
    bi.service_option_id,
    bi.quantity,
    bi.subtotal_price,

    so.name AS service_option_name,
    so.unit,
    so.unit_price,

    s.service_id,
    s.servicename,

    c.category_id,
    c.name AS category_name

  FROM booking b
  LEFT JOIN booking_item bi ON b.booking_id = bi.booking_id
  LEFT JOIN service_option so ON bi.service_option_id = so.service_option_id
  LEFT JOIN services s ON so.service_id = s.service_id
  LEFT JOIN service_categories c ON s.category_id = c.category_id
 WHERE b.admin_id = ${admin.adminId}
${
  searchFilter
    ? sql`AND (b.order_code ILIKE ${`%${searchFilter}%`} OR s.servicename ILIKE ${`%${searchFilter}%`})`
    : sql``
}
${
  servicenameFilter
    ? sql`AND s.servicename = ${servicenameFilter}`
    : sql``
}
${statusFilter ? sql`AND b.status_id = ${statusFilter}` : sql``}
ORDER BY b.create_at DESC
`;

    return res.json(bookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

// ใช้ Admin Auth Middleware แทน withAuth
export default withAdminAuth(handler, ["admin", "technician"]);
