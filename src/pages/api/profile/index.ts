import type { NextApiResponse } from "next";
import { query } from "../../../../lib/db";
import { withAuth, AuthenticatedNextApiRequest } from "../../../middlewere/auth";

// GET /api/profile
// Returns user information along with the address records (only one address per user may exist)
// for use in the profile edit form.
async function handler(req: AuthenticatedNextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "GET") {
      res.setHeader("Allow", "GET");
      return res.status(405).json({ error: "Method Not Allowed" });
    }

    const userId = Number(req.user?.userId);
    if (!userId || Number.isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user id" });
    }

    const sql = `
      SELECT 
        u.user_id,
        u.fullname,
        u.email,
        u.phone_number,
        u.create_at,
        u.avatar,
        CASE WHEN a.address_id IS NULL THEN NULL ELSE json_build_object(
          'address_id', a.address_id,
          'user_id', a.user_id,
          'address', a.address,
          'province_code', a.province_code,
          'district_code', a.district_code,
          'subdistrict_code', a.subdistrict_code
        ) END AS address
      FROM users u
      LEFT JOIN addresses a ON a.user_id = u.user_id
      WHERE u.user_id = $1
    `;

    const result = await query(sql, [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const row = result.rows[0] as any;

    // Keep API compatible: return addresses as an array, though there can be only one
    const addresses = row.address ? [row.address] : [];

    return res.status(200).json({
      user_id: row.user_id,
      fullname: row.fullname,
      email: row.email,
      phone_number: row.phone_number,
      create_at: row.create_at,
      avatar: row.avatar || null,
      addresses,
    });
  } catch (err) {
    console.error("/api/profile error", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

export default withAuth(handler);
