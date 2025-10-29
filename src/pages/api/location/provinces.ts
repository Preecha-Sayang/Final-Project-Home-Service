import type { NextApiRequest, NextApiResponse } from "next";
import { query as dbQuery } from "../../../../lib/db";

// GET /api/location/provinces
// คืนค่ารายการจังหวัดที่ไม่ซ้ำกันจากตาราง geography
// รูปแบบ: [{ province_code: number, province_name_th: string, province_name_en: string }, ...]
export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  if (request.method !== "GET") {
    response.setHeader("Allow", ["GET"]);
    return response.status(405).json({ message: `Method ${request.method} Not Allowed` });
  }

  try {
    const sql = `
      SELECT DISTINCT
        province_code,
        province_name_th,
        province_name_en
      FROM geography
      ORDER BY province_name_th ASC
    `;

    const { rows } = await dbQuery(sql);

    return response.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching provinces:", error);
    return response.status(500).json({ message: "Internal server error" });
  }
}
