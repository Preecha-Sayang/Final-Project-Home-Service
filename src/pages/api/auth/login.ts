import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { query } from "../../../../lib/db";

const JWT_SECRET = process.env.JWT_SECRET || "your_super_secret_jwt_key";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  try {
    // ดึงผู้ใช้จากฐานข้อมูล
    const result = await query(`SELECT * FROM users WHERE email = $1`, [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    // ตรวจสอบรหัสผ่าน
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    // สร้าง JWT token
    const token = jwt.sign(
      { user_id: user.user_id, email: user.email, fullname: user.fullname },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({ token, user: { user_id: user.user_id, fullname: user.fullname, email: user.email } });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}