import type { NextApiRequest, NextApiResponse } from "next";
import { Pool } from "pg";

// สร้างการเชื่อมต่อฐานข้อมูล
const databasePool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// type ข้อมูลที่จะส่งกลับไปยัง frontend
interface ServiceCategories {
  category_id: number;
  name: string;
  description: string;
  bg_color_hex: string;
  text_color_hex: string;
  ring_color_hex: string;
  create_at: number;
  update_at: number;
}

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
      SELECT 
        category_id, 
        name, 
        description, 
        bg_color_hex, 
        text_color_hex, 
        ring_color_hex,
        create_at, 
        update_at
      FROM service_categories
      ORDER BY category_id ASC
    `;

    if (topOnly === "true") {
      query += ` LIMIT 3;`; // ดึง 3 อันแรก
    }

    const { rows } = await client.query(query);
    client.release();

    const categories: ServiceCategories[] = rows.map((row) => ({
      category_id: row.category_id,
      name: row.name,
      description: row.description,
      bg_color_hex: row.bg_color_hex,
      text_color_hex: row.text_color_hex,
      ring_color_hex: row.ring_color_hex,
      create_at: new Date(row.create_at).getTime(),
      update_at: new Date(row.update_at).getTime(),
    }));

    return response.status(200).json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return response.status(500).json({ message: "Internal server error" });
  }
}
