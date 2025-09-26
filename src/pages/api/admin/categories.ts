// ดึง หมวดหมู่มาแสดงเป็นตัวเลือก
import type { NextApiRequest, NextApiResponse } from "next";
import pool from "lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") return res.status(405).end();

    try {
        const { rows } = await pool.query(
            `SELECT category_id AS value, name AS label 
                FROM service_categories 
                ORDER BY category_id
            `);

        res.status(200).json(rows);

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "Failed to fetch categories.",
        });
    }
}

// ***กำหนดค่าไว้ก่อน เดี๋ยวมาทำต่อ***