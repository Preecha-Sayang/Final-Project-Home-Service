import type { NextApiRequest, NextApiResponse } from "next";
import pool from "@../../../lib/db";
import { signAdminAccess } from "lib/server/jwtAdmin";





export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method !== "POST") return res.status(405).end();

    const { email, password } = req.body ?? {};
    // console.log("GET Body:", email, password);
    if (!email || !password)
      return res.status(400).json({ message: "email/password required" });

    const { rows } = await pool.query(
      "SELECT admin_id, email, password, role FROM admin WHERE email = $1 and password = $2 LIMIT 1",
      [email, password]
    );
    const admin = rows[0];
    if (!admin)
      return res
        .status(401)
        .json({ message: "Invalid credentials", error: "Login failed." });

    const ok = await bcrypt.compare(password, admin.password_hash);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const { token } = signAdminAccess({
      adminId: String(admin.admin_id),
      role: admin.role,
      email: admin.email,
    });
    return res.json({
      token,
      admin: { admin_id: admin.admin_id, email: admin.email, role: admin.role },
    });
  } catch (error) {
    console.log("Error IS:", error);
  }
}
