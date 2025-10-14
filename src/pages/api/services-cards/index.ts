import type { NextApiRequest, NextApiResponse } from "next";
import { Pool } from "pg";

// สร้างการเชื่อมต่อฐานข้อมูล
const databasePool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// type ข้อมูลที่จะส่งกลับไปยัง frontend
interface ServiceWithCategoryAndPrice {
  service_id: number;
  servicename: string;
  category: string;
  image_url: string;
  price: string;
  description: string;
  min_price: number;
  max_price: number;
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
        s.service_id,
        s.servicename,
        s.image_url,
        s.description,
        c.name AS category,
        MIN(o.unit_price) AS min_price,
        MAX(o.unit_price) AS max_price
      FROM services s
      JOIN service_categories c ON s.category_id = c.category_id
      LEFT JOIN service_option o ON s.service_id = o.service_id
      GROUP BY s.service_id, s.servicename, s.image_url, s.description, c.name
    `;

    if (topOnly === "true") {
      query += ` ORDER BY RANDOM() LIMIT 3;`; // ดึงแรนด้อม 3 อัน
    } else {
      query += ` ORDER BY s.service_id ASC;`; // ดึงทุก service
    }

    const { rows } = await client.query(query);
    client.release();

    const services: ServiceWithCategoryAndPrice[] = rows.map((row) => {
      const minPrice = Number(row.min_price);
      const maxPrice = Number(row.max_price);

      let priceText: string;
      if (minPrice === maxPrice) {
        priceText = `ค่าบริการประมาณ ${minPrice.toLocaleString()} ฿`;
      } else {
        priceText = `ค่าบริการประมาณ ${minPrice.toLocaleString()} - ${maxPrice.toLocaleString()} ฿`;
      }

      return {
        service_id: row.service_id,
        servicename: row.servicename,
        category: row.category,
        image_url: row.image_url,
        price: priceText,
        description: row.description,
        min_price: minPrice,
        max_price: maxPrice,
      };
    });

    return response.status(200).json(services);
  } catch (error) {
    console.error("Error fetching services:", error);
    return response.status(500).json({ message: "Internal server error" });
  }
}
