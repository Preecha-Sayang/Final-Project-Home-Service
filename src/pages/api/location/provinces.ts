import type { NextApiRequest, NextApiResponse } from "next";
import { Pool } from "pg";

// สร้างการเชื่อมต่อฐานข้อมูล
const databasePool = new Pool({
  connectionString: process.env.DATABASE_URL,
});


export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  if (request.method !== "GET") {
    response.setHeader("Allow", ["GET"]);
    return response.status(405).json({ message: `Method ${request.method} Not Allowed` });
  }

  const { topOnly } = request.query;

  try {
    const client = await databasePool.connect();

    let query = `
      SELECT * FROM province
    `;

    const { rows } = await client.query(query);
    client.release();


    return response.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching services:", error);
    return response.status(500).json({ message: "Internal server error" });
  }
}
