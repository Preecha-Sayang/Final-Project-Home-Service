import type { NextApiRequest, NextApiResponse } from "next";
import pool from "../../../../lib/db";
import { signAdminAccess } from "lib/server/jwtAdmin";
import bcrypt from "bcrypt";
import cookie from "cookie";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method !== "POST") return res.status(405).end();

    // ดึง email / password จาก body//
    const { email, password } = req.body ?? {};
    // console.log("GET Body:", email, password);
    if (!email || !password)
      return res.status(400).json({ message: "email/password required" });

    // Query หาข้อมูล admin จาก database//
    const { rows } = await pool.query(
      "SELECT admin_id, email, password, role FROM admin WHERE email = $1  LIMIT 1",
      [email]
    );
    const admin = rows[0];
    if (!admin)
      return res.status(401).json({
        message: "Invalid credentials",
        error: "Login failed.",
      });

    const ok = await bcrypt.compare(password, admin.password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const { token } = signAdminAccess({
      adminId: String(admin.admin_id),
      role: admin.role,
      email: admin.email,
    });

    // เพิ่ม set cookie
    res.setHeader(
      "Set-Cookie",
      cookie.serialize("accessToken", token, {
        httpOnly: true, 
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 วัน
      })
    );
    // จบ เพิ่ม set cookie

    return res.json({
      token,
      admin: { adminId: admin.admin_id, email: admin.email, role: admin.role },
    });
  } catch (error) {
    console.log("Error IS:", error);
  }
}
