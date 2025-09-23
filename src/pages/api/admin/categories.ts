// จัดการ หมวดหมู่หลัก
import type { NextApiRequest, NextApiResponse } from "next";
import pool from "@../../../lib/db";
import { withAdminAuth, AdminJwt } from "lib/server/withAdminAuth";

type ReqWithAdmin = NextApiRequest & { admin: AdminJwt };

async function handler(req: ReqWithAdmin, res: NextApiResponse) {
    if (req.method !== "POST") return res.status(405).end();

    const { name } = req.body ?? {};
    if (!name?.trim()) return res.status(400).json({ message: "name required" });

    const { rows } = await pool.query(
        `INSERT INTO service_categories (name, created_by_admin)
     VALUES ($1,$2)
     RETURNING category_id AS id, name`,
        [name.trim(), req.admin.adminId]
    );

    return res.json({ category: rows[0] });
}

export default withAdminAuth<ReqWithAdmin>(handler, ["superadmin", "manager"]);


// หน้าที่หลัก: เพิ่ม หมวดหมู่ (service_categories) ใหม่ลง DB
// ใช้ pool.query → ต่อกับฐานข้อมูลจริง
// คืนค่า: category (id + name)
// จำกัดสิทธิ์: ["superadmin", "manager"]