import type { NextApiRequest, NextApiResponse } from "next";
import pool from "../../../lib/db";


interface Service {
  service_id: number;
  servicename: string;
  category_id: number;
  image_url: string;
  price: string;
  description: string;
}


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Service[] | { error: string }>
) {
  try {
    const result = await pool.query(
      "SELECT service_id, servicename, category_id, image_url, price, description FROM services ORDER BY service_id ASC"
    );
    res.status(200).json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
