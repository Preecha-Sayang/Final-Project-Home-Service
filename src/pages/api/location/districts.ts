import type { NextApiRequest, NextApiResponse } from "next";
import { Pool } from "pg";

// สร้างการเชื่อมต่อฐานข้อมูล
const databasePool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// GET /api/location/districts?province_code=XX
// คืนค่ารายการเขต/อำเภอตามจังหวัดที่เลือกจากตาราง geography
// รูปแบบ: [{ district_code: number, district_name_th: string, district_name_en: string }, ...]
export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  if (request.method !== "GET") {
    response.setHeader("Allow", ["GET"]);
    return response.status(405).json({ message: `Method ${request.method} Not Allowed` });
  }

  const { province_code } = request.query;

  try {
    const client = await databasePool.connect();

    const sql = `
      SELECT DISTINCT
        district_code,
        district_name_th,
        district_name_en
      FROM geography
      WHERE province_code = $1
      ORDER BY district_name_th ASC
    `;


    const { rows } = await client.query(sql, [province_code]);
    client.release();


    return response.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching services:", error);
    return response.status(500).json({ message: "Internal server error" });
  }
}
