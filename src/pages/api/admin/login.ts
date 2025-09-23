import type { NextApiRequest, NextApiResponse } from "next";
import pool from "@../../../lib/db";
import { signAdminAccess } from "lib/server/jwtAdmin";
import bcrypt from "bcryptjs";
import nookies from "nookies";



export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") return res.status(405).end();

    const { email, password } = req.body ?? {};
    if (!email || !password) return res.status(400).json({ message: "email/password required" });

    const { rows } = await pool.query(
        "SELECT admin_id, email, password_hash, role, is_active FROM admins WHERE email = $1 LIMIT 1",
        [email]
    );
    const admin = rows[0];
    if (!admin || !admin.is_active) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, admin.password_hash);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const { token } = signAdminAccess({ adminId: String(admin.admin_id), role: admin.role, email: admin.email });
    return res.json({
        token,
        admin: { adminId: admin.admin_id, email: admin.email, role: admin.role }
    });
}
