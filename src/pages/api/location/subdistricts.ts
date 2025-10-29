import type { NextApiRequest, NextApiResponse } from "next";
import { Pool } from "pg";

// สร้างการเชื่อมต่อฐานข้อมูล
const databasePool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// GET /api/location/subdistricts?district_code=XX
// คืนค่ารายการแขวง/ตำบลตามเขต/อำเภอที่เลือกจากตาราง geography
// รูปแบบ: [{ subdistrict_code: number, subdistrict_name_th: string, subdistrict_name_en: string }, ...]
export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  if (request.method !== "GET") {
    response.setHeader("Allow", ["GET"]);
    return response.status(405).json({ message: `Method ${request.method} Not Allowed` });
  }

  const { district_code } = request.query;

  try {
    const client = await databasePool.connect();

    const sql = `
      SELECT DISTINCT
        subdistrict_code,
        subdistrict_name_th,
        subdistrict_name_en
      FROM geography
      WHERE district_code = $1
      ORDER BY subdistrict_name_th ASC
    `;


    const { rows } = await client.query(sql, [district_code]);
    client.release();


    return response.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching services:", error);
    return response.status(500).json({ message: "Internal server error" });
  }
}
