// (GET: public)
import type { NextApiRequest, NextApiResponse } from "next";
import pool from "../../../lib/db";   // ✅ ใช้ alias และ named import

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") return res.status(405).end();

    const { rows } = await pool.query(
        "SELECT category_id AS id, name FROM service_categories ORDER BY name ASC"
    );
    return res.json({ categories: rows });
}
